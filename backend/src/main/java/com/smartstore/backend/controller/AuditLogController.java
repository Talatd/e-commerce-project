package com.smartstore.backend.controller;

import com.smartstore.backend.model.AuditLog;
import com.smartstore.backend.repository.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Platform activity monitoring")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @Operation(summary = "Get recent audit logs")
    public ResponseEntity<List<AuditLog>> getAll() {
        return ResponseEntity.ok(auditLogRepository.findTop100ByOrderByCreatedAtDesc());
    }

    @PostMapping
    @Operation(summary = "Record an audit event")
    public ResponseEntity<AuditLog> create(@RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserDetails principal) {
        AuditLog log = AuditLog.builder()
                .username(principal.getUsername())
                .action(body.getOrDefault("action", "Unknown"))
                .type(body.getOrDefault("type", "info"))
                .detail(body.getOrDefault("detail", ""))
                .build();
        AuditLog saved = auditLogRepository.save(Objects.requireNonNull(log));
        return ResponseEntity.ok(saved);
    }
}
