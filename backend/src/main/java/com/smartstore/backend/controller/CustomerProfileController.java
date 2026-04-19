package com.smartstore.backend.controller;

import com.smartstore.backend.model.CustomerProfile;
import com.smartstore.backend.repository.CustomerProfileRepository;
import com.smartstore.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@Tag(name = "Customer Profiles", description = "Extended customer data and analytics")
public class CustomerProfileController {

    private final CustomerProfileRepository profileRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all profiles (admin only)")
    public ResponseEntity<List<CustomerProfile>> getAll() {
        return ResponseEntity.ok(profileRepository.findAll());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user's profile")
    public ResponseEntity<CustomerProfile> getMyProfile(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return profileRepository.findByUser(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get profile by user ID (admin only)")
    public ResponseEntity<CustomerProfile> getByUser(@PathVariable Long userId) {
        var user = userRepository.findById(Objects.requireNonNull(userId)).orElseThrow();
        return profileRepository.findByUser(user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create or update a customer profile")
    public ResponseEntity<CustomerProfile> createOrUpdate(@RequestBody CustomerProfile profile) {
        if (profile.getUser() != null) {
            var existing = profileRepository.findByUser(profile.getUser());
            if (existing.isPresent()) {
                CustomerProfile p = existing.get();
                p.setGender(profile.getGender());
                p.setAge(profile.getAge());
                p.setCity(profile.getCity());
                p.setCountry(profile.getCountry());
                p.setMembershipType(profile.getMembershipType());
                p.setSatisfactionLevel(profile.getSatisfactionLevel());
                p.setPreferredPaymentMethod(profile.getPreferredPaymentMethod());
                return ResponseEntity.ok(profileRepository.save(p));
            }
        }
        return ResponseEntity.ok(profileRepository.save(profile));
    }
}
