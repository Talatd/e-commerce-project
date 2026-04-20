package com.smartstore.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("all")
class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", Long.valueOf(3600000L));
    }

    private UserDetails testUser() {
        return new User("test@example.com", "password", Collections.emptyList());
    }

    @Test
    void generateToken_ReturnsNonNull() {
        String token = jwtService.generateToken(testUser());
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void extractUsername_ReturnsCorrectEmail() {
        String token = jwtService.generateToken(testUser());
        String username = jwtService.extractUsername(token);
        assertEquals("test@example.com", username);
    }

    @Test
    void isTokenValid_WithValidToken_ReturnsTrue() {
        UserDetails user = testUser();
        String token = jwtService.generateToken(user);
        assertTrue(jwtService.isTokenValid(token, user));
    }

    @Test
    void isTokenValid_WithWrongUser_ReturnsFalse() {
        String token = jwtService.generateToken(testUser());
        UserDetails other = new User("other@example.com", "pass", Collections.emptyList());
        assertFalse(jwtService.isTokenValid(token, other));
    }

    @Test
    void generateRefreshToken_ContainsRefreshClaim() {
        String refreshToken = jwtService.generateRefreshToken(testUser());
        assertNotNull(refreshToken);
        assertTrue(jwtService.isRefreshToken(refreshToken));
    }

    @Test
    void isRefreshToken_WithAccessToken_ReturnsFalse() {
        String accessToken = jwtService.generateToken(testUser());
        assertFalse(jwtService.isRefreshToken(accessToken));
    }
}
