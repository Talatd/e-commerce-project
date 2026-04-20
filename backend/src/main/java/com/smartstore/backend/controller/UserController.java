package com.smartstore.backend.controller;

import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Users", description = "Admin-only user management endpoints")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "List all users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a user")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        User user = userRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        user.setFullName(userDetails.getFullName());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setEnabled(userDetails.isEnabled());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/ban")
    @Operation(summary = "Ban a user")
    public ResponseEntity<User> banUser(@PathVariable Long id) {
        User user = userRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        user.setEnabled(false);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
