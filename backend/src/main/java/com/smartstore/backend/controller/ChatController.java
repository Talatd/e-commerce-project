package com.smartstore.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
}
