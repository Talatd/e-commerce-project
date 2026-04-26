package com.smartstore.backend.repository;

import com.smartstore.backend.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop100ByOrderByCreatedAtDesc();
    List<AuditLog> findByUsernameOrderByCreatedAtDesc(String username);

    java.util.Optional<AuditLog> findTop1ByActionAndDetailContainingIgnoreCaseOrderByCreatedAtDesc(String action, String detailPart);
}
