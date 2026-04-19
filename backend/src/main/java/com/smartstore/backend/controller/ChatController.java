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

    @Value("${smartstore.ai.url:http://localhost:8000}")
    private String aiServiceUrl;

    @PostMapping("/ask")
    @Operation(summary = "Ask the AI chatbot", description = "Forwards the question to the AI service with user context.")
    public ResponseEntity<Map<String, Object>> ask(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("query", payload.get("query"));
        aiRequest.put("user_id", user.getUserId());
        aiRequest.put("role", user.getRole().name());
        aiRequest.put("history", payload.getOrDefault("history", List.of()));

        RestTemplate restTemplate = new RestTemplate();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/chatbot/query", aiRequest, Map.class);
            return ResponseEntity.ok(response != null ? response : Map.of("error", "Empty response"));
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
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();

        new Thread(() -> {
            try {
                String jsonBody = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(Map.of(
                        "query", payload.get("query"),
                        "user_id", user.getUserId(),
                        "role", user.getRole().name(),
                        "history", payload.getOrDefault("history", List.of())
                ));

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
}
