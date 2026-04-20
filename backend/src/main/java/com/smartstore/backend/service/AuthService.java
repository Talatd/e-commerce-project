package com.smartstore.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstore.backend.dto.AuthRequest;
import com.smartstore.backend.dto.AuthResponse;
import com.smartstore.backend.model.PasswordResetToken;
import com.smartstore.backend.model.Role;
import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.PasswordResetTokenRepository;
import com.smartstore.backend.repository.UserRepository;
import com.smartstore.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MailService mailService;

    public AuthResponse register(User userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new IllegalStateException("An account with this email already exists");
        }

        User user = new User();
        user.setFullName(userRequest.getFullName());
        user.setEmail(userRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userRequest.getPasswordHash()));
        /* Public registration must not trust client-supplied role (privilege escalation). */
        user.setRole(Role.CONSUMER);
        user.setEnabled(true);

        userRepository.save(user);
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.Collections.emptyList());

        return AuthResponse.builder()
                .token(jwtService.generateToken(userDetails))
                .refreshToken(jwtService.generateRefreshToken(userDetails))
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.Collections.emptyList());

        return AuthResponse.builder()
                .token(jwtService.generateToken(userDetails))
                .refreshToken(jwtService.generateRefreshToken(userDetails))
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        var user = userRepository.findByEmail(email).orElseThrow();
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPasswordHash(), java.util.Collections.emptyList());

        if (!jwtService.isTokenValid(refreshToken, userDetails) || !jwtService.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        return AuthResponse.builder()
                .token(jwtService.generateToken(userDetails))
                .refreshToken(jwtService.generateRefreshToken(userDetails))
                .userId(user.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Verifies the access token with Google's userinfo endpoint.
     */
    public AuthResponse loginWithGoogleAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalArgumentException("Google access token is required");
        }
        try {
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.googleapis.com/oauth2/v3/userinfo"))
                    .header("Authorization", "Bearer " + accessToken.trim())
                    .timeout(Duration.ofSeconds(12))
                    .GET()
                    .build();
            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                throw new IllegalArgumentException("Invalid or expired Google token");
            }
            JsonNode root = objectMapper.readTree(res.body());
            JsonNode emailVerified = root.get("email_verified");
            if (emailVerified == null || emailVerified.isNull() || !emailVerified.asBoolean()) {
                throw new IllegalStateException("Google account email must be verified");
            }
            String email = jsonText(root, "email");
            String name = jsonText(root, "name");
            if (email == null || email.isBlank()) {
                throw new IllegalStateException("Google account has no email on file");
            }
            final String finalEmail = email;
            String resolvedName = (name != null && !name.isBlank()) ? name
                    : (email.contains("@") ? email.substring(0, email.indexOf('@')) : email);
            final String finalName = resolvedName;

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User u = new User();
                u.setEmail(finalEmail);
                u.setFullName(finalName);
                u.setPasswordHash(passwordEncoder.encode(UUID.randomUUID() + "oauth-google"));
                u.setRole(Role.CONSUMER);
                u.setEnabled(true);
                return userRepository.save(u);
            });

            var userDetails = new org.springframework.security.core.userdetails.User(
                    user.getEmail(), user.getPasswordHash(), java.util.Collections.emptyList());

            return AuthResponse.builder()
                    .token(jwtService.generateToken(userDetails))
                    .refreshToken(jwtService.generateRefreshToken(userDetails))
                    .userId(user.getUserId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .role(user.getRole().name())
                    .build();
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google sign-in failed: " + e.getMessage());
        }
    }

    /**
     * Always succeeds from a security perspective (no email enumeration).
     * Sends mail only when an account exists for the email.
     */
    @Transactional
    public void requestPasswordReset(String email) {
        if (email == null || email.isBlank()) {
            return;
        }
        String trimmed = email.trim();
        var userOpt = userRepository.findByEmail(trimmed);
        if (userOpt.isEmpty()) {
            return;
        }
        User user = userOpt.get();
        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.flush();
        String raw = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken prt = Objects.requireNonNull(
                PasswordResetToken.builder()
                        .user(user)
                        .token(raw)
                        .expiresAt(LocalDateTime.now().plusHours(1))
                        .used(false)
                        .build());
        passwordResetTokenRepository.save(prt);
        mailService.sendPasswordReset(user.getEmail(), raw);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        PasswordResetToken prt = passwordResetTokenRepository.findByTokenAndUsedFalse(token.trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset link"));
        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset link has expired");
        }
        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
        User u = prt.getUser();
        u.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(u);
    }

    private static String jsonText(JsonNode n, String field) {
        if (n == null || !n.has(field) || n.get(field).isNull()) {
            return null;
        }
        String t = n.get(field).asText();
        return t == null || t.isBlank() ? null : t;
    }
}
