package com.smartstore.backend.controller;

import com.smartstore.backend.model.Shipment;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ShipmentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Shipment tracking and management")
public class ShipmentController {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    @Operation(summary = "List all shipments")
    public ResponseEntity<List<Shipment>> getAll() {
        return ResponseEntity.ok(shipmentRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipment by ID")
    public ResponseEntity<Shipment> getById(@PathVariable Long id) {
        return shipmentRepository.findById(Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Track shipment by tracking number")
    public ResponseEntity<Shipment> track(@PathVariable String trackingNumber) {
        return shipmentRepository.findByTrackingNumber(trackingNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get shipment by order ID")
    public ResponseEntity<Shipment> getByOrder(@PathVariable Long orderId) {
        var order = orderRepository.findById(Objects.requireNonNull(orderId)).orElseThrow();
        return shipmentRepository.findByOrder(order)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a shipment for an order")
    public ResponseEntity<Shipment> create(@RequestBody Shipment shipment) {
        if (shipment.getTrackingNumber() == null || shipment.getTrackingNumber().isBlank()) {
            shipment.setTrackingNumber("FX-" + System.currentTimeMillis());
        }
        return ResponseEntity.ok(shipmentRepository.save(shipment));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update shipment status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Shipment shipment = shipmentRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        shipment.setStatus(Shipment.ShipmentStatus.valueOf(newStatus.toUpperCase()));

        if (shipment.getStatus() == Shipment.ShipmentStatus.SHIPPED && shipment.getShippedAt() == null) {
            shipment.setShippedAt(LocalDateTime.now());
        }
        if (shipment.getStatus() == Shipment.ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
            shipment.setOnTimeDelivery(
                    shipment.getEstimatedDelivery() == null || !LocalDateTime.now().isAfter(shipment.getEstimatedDelivery()));
        }
        return ResponseEntity.ok(shipmentRepository.save(shipment));
    }
}
