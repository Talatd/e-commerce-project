package com.smartstore.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.smartstore.backend.model.AuditLog;
import com.smartstore.backend.repository.AuditLogRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.model.User;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Proxy to the AI chatbot service with role-based access")
public class ChatController {

    private final com.smartstore.backend.repository.UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final AuditLogRepository auditLogRepository;

    @Value("${smartstore.ai.url:http://localhost:8000}")
    private String aiServiceUrl;

    @PostMapping("/ask")
    @Operation(summary = "Ask the AI chatbot", description = "Forwards the question to the AI service with user context.")
    public ResponseEntity<Map<String, Object>> ask(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Long sessionStoreId = resolveSessionStoreId(user);

        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("query", payload.get("query"));
        aiRequest.put("user_id", user.getUserId());
        aiRequest.put("role", user.getRole().name());
        aiRequest.put("history", payload.getOrDefault("history", List.of()));
        if (sessionStoreId != null) {
            // Sent to the AI service so it can enforce store-scoped data access.
            aiRequest.put("session_store_id", sessionStoreId);
        }
        if (payload.containsKey("session_id")) {
            aiRequest.put("session_id", payload.get("session_id"));
        }

        RestTemplate restTemplate = new RestTemplate();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/chatbot/query", aiRequest, Map.class);
            Map<String, Object> safeResponse = response != null ? response : Map.of("error", "Empty response");
            recordGuardrailEventIfAny(principal.getUsername(), user.getUserId(), sessionStoreId, payload, safeResponse);
            return ResponseEntity.ok(safeResponse);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "response", "AI service is currently unavailable. Please try again later.",
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream AI chatbot response", description = "SSE stream with agent execution steps for transparency.")
    public SseEmitter askStream(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        SseEmitter emitter = new SseEmitter(60000L);
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Long sessionStoreId = resolveSessionStoreId(user);

        new Thread(() -> {
            try {
                Map<String, Object> reqBody = new HashMap<>();
                reqBody.put("query", payload.get("query"));
                reqBody.put("user_id", user.getUserId());
                reqBody.put("role", user.getRole().name());
                reqBody.put("history", payload.getOrDefault("history", List.of()));
                if (sessionStoreId != null) {
                    reqBody.put("session_store_id", sessionStoreId);
                }
                if (payload.containsKey("session_id")) {
                    reqBody.put("session_id", payload.get("session_id"));
                }
                String jsonBody = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(reqBody);

                URL url = java.net.URI.create(aiServiceUrl + "/api/v1/chatbot/query/stream").toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.getOutputStream().write(jsonBody.getBytes(StandardCharsets.UTF_8));

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        emitter.send(SseEmitter.event().data(Objects.requireNonNull(line.substring(6))));
                    }
                }
                reader.close();
                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event().data(
                            "{\"type\":\"error\",\"message\":\"" + e.getMessage() + "\"}"));
                } catch (Exception ignored) {}
                emitter.complete();
            }
        }).start();

        return emitter;
    }

    private Long resolveSessionStoreId(User user) {
        if (user == null || user.getUserId() == null) return null;
        return storeRepository.findByOwnerId(user.getUserId())
                .map(s -> s.getId())
                .or(() -> storeRepository.findByOwnerName(user.getFullName()).map(s -> s.getId()))
                .orElse(null);
    }

    private static boolean isTruthy(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(v.toString().trim());
    }

    private void recordGuardrailEventIfAny(
            String username,
            Long userId,
            Long sessionStoreId,
            Map<String, Object> requestPayload,
            Map<String, Object> aiResponse
    ) {
        if (aiResponse == null) return;

        // We treat responses marked as blocked/guardrail as security audit events.
        boolean blocked = isTruthy(aiResponse.get("blocked")) || isTruthy(aiResponse.get("guardrail_blocked"));
        String detectionType = aiResponse.get("detection_type") != null ? aiResponse.get("detection_type").toString() : null;
        String guardrail = aiResponse.get("guardrail") != null ? aiResponse.get("guardrail").toString() : null;

        if (!blocked && detectionType == null && guardrail == null) return;

        String query = requestPayload != null && requestPayload.get("query") != null ? requestPayload.get("query").toString() : "";
        // Keep the audit detail short and avoid storing full user text if possible.
        String querySnippet = query.length() > 140 ? query.substring(0, 140) + "…" : query;

        Map<String, Object> detail = new HashMap<>();
        detail.put("user_id", userId);
        detail.put("session_store_id", sessionStoreId);
        if (detectionType != null) detail.put("detection_type", detectionType);
        if (guardrail != null) detail.put("guardrail", guardrail);
        detail.put("action", blocked ? "blocked" : "flagged");
        detail.put("query_snippet", querySnippet);

        String detailJson;
        try {
            detailJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail);
        } catch (Exception e) {
            detailJson = detail.toString();
        }

        AuditLog log = AuditLog.builder()
                .username(username)
                .action("AI_GUARDRAIL")
                .type(blocked ? "blocked" : "security")
                .detail(detailJson)
                .build();
        auditLogRepository.save(Objects.requireNonNull(log));
    }
}
