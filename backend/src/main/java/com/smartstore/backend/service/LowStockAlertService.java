package com.smartstore.backend.service;

import com.smartstore.backend.model.AuditLog;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.Store;
import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.AuditLogRepository;
import com.smartstore.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LowStockAlertService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    @Value("${app.stock.low-threshold:5}")
    private int lowThreshold;

    @Value("${app.stock.low-alert-cooldown-minutes:360}")
    private int cooldownMinutes;

    @SuppressWarnings("null")
    public void maybeAlert(Product product, String triggeredBy) {
        if (product == null || product.getProductId() == null) return;
        Integer stock = product.getStockQuantity();
        if (stock == null) return;
        if (stock > lowThreshold) return;

        // spam prevention: if we already alerted for this product recently, skip
        String key = "productId=" + product.getProductId();
        var last = auditLogRepository.findTop1ByActionAndDetailContainingIgnoreCaseOrderByCreatedAtDesc("LOW_STOCK_ALERT", key);
        if (last.isPresent()) {
            LocalDateTime at = last.get().getCreatedAt();
            if (at != null && Duration.between(at, LocalDateTime.now()).toMinutes() < cooldownMinutes) {
                return;
            }
        }

        String who = triggeredBy == null || triggeredBy.isBlank() ? "system" : triggeredBy;
        String detail = "Low stock threshold breached: productId=" + product.getProductId()
                + ", name=\"" + safe(product.getName()) + "\""
                + ", stock=" + stock
                + ", threshold=" + lowThreshold;

        auditLogRepository.save(AuditLog.builder()
                .username(who)
                .action("LOW_STOCK_ALERT")
                .type("INVENTORY")
                .detail(detail)
                .build());

        // email store owner if available
        Store store = product.getStore();
        Long ownerId = store != null ? store.getOwnerId() : null;
        if (ownerId != null) {
            User owner = userRepository.findById(ownerId).orElse(null);
            if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
                mailService.sendLowStockAlert(owner.getEmail(), product, lowThreshold);
            }
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s.replace("\"", "'");
    }
}

