package com.smartstore.backend.controller;

import com.smartstore.backend.dto.AuthRequest;
import com.smartstore.backend.dto.AuthResponse;
import com.smartstore.backend.model.User;
import com.smartstore.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration and login with JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account and returns JWT tokens.")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user", description = "Verifies credentials and returns user details with JWT tokens.")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Uses a refresh token to issue new access + refresh tokens.")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }
        return ResponseEntity.ok(authService.refreshToken(refreshToken));
    }
}
