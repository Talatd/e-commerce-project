package com.smartstore.backend.controller;

import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for fetching dashboard statistics and KPI data")
public class AnalyticsController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    @GetMapping("/admin-stats")
    @Operation(summary = "Get platform-wide statistics", description = "Aggregates revenue, order counts, and user metrics for the admin dashboard.")
    public ResponseEntity<Map<String, Object>> getAdminStats() {
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();
        long totalStores = storeRepository.count();
        
        // Mock revenue calculation for now
        BigDecimal totalRevenue = orderRepository.findAll().stream()
                .map(o -> o.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ResponseEntity.ok(Map.of(
            "totalOrders", totalOrders,
            "totalProducts", totalProducts,
            "totalUsers", totalUsers,
            "totalStores", totalStores,
            "totalRevenue", totalRevenue,
            "revenueGrowth", 12.5,
            "activeSessions", 847,
            "monthlyRevenue", List.of(
                Map.of("label", "Jan", "val", 45),
                Map.of("label", "Feb", "val", 52),
                Map.of("label", "Mar", "val", 48),
                Map.of("label", "Apr", "val", 70),
                Map.of("label", "May", "val", 85),
                Map.of("label", "Jun", "val", 62),
                Map.of("label", "Jul", "val", 78),
                Map.of("label", "Aug", "val", 92),
                Map.of("label", "Sep", "val", 88),
                Map.of("label", "Oct", "val", 95)
            )
        ));
    }
}
