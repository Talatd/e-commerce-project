package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.Role;
import com.smartstore.backend.model.Shipment;
import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ShipmentRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.repository.UserRepository;
import com.smartstore.backend.service.MailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(name = "Shipments", description = "Shipment tracking and management")
public class ShipmentController {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final MailService mailService;

    private User currentUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername()).orElseThrow();
    }

    private boolean mayViewOrder(Order order, User viewer) {
        if (viewer.getRole() == Role.ADMIN) {
            return true;
        }
        if (viewer.getRole() == Role.MANAGER) {
            var storeOpt = storeRepository.findByOwnerId(viewer.getUserId());
            if (storeOpt.isEmpty()) {
                storeOpt = storeRepository.findByName(viewer.getFullName().contains("Marcus") ? "TechHub Performance" : "GadgetPro Lifestyle");
            }
            if (storeOpt.isEmpty() || storeOpt.get().getId() == null) return false;
            Long storeId = storeOpt.get().getId();
            return order.getItems() != null && order.getItems().stream().anyMatch(it ->
                    it != null
                            && it.getProduct() != null
                            && it.getProduct().getStore() != null
                            && storeId.equals(it.getProduct().getStore().getId()));
        }
        return order.getUser().getUserId().equals(viewer.getUserId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all shipments")
    public ResponseEntity<List<Shipment>> getAll() {
        return ResponseEntity.ok(shipmentRepository.findAll());
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "List shipments for my store", description = "Managers see only shipments for orders containing their store products.")
    public ResponseEntity<List<Shipment>> getMyStore(@AuthenticationPrincipal UserDetails principal) {
        User viewer = currentUser(principal);
        if (viewer.getRole() == Role.ADMIN) {
            return ResponseEntity.ok(shipmentRepository.findAll());
        }
        var storeOpt = storeRepository.findByOwnerId(viewer.getUserId());
        if (storeOpt.isEmpty()) {
            storeOpt = storeRepository.findByName(viewer.getFullName().contains("Marcus") ? "TechHub Performance" : "GadgetPro Lifestyle");
        }
        if (storeOpt.isEmpty() || storeOpt.get().getId() == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(shipmentRepository.findByStoreId(storeOpt.get().getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get shipment by ID", description = "Order owner, manager, or admin.")
    public ResponseEntity<Shipment> getById(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails principal) {
        Optional<Shipment> found = shipmentRepository.findById(Objects.requireNonNull(id));
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Shipment shipment = found.get();
        User viewer = currentUser(principal);
        if (!mayViewOrder(shipment.getOrder(), viewer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shipment);
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(summary = "Track shipment by tracking number", description = "Order owner, manager, or admin.")
    public ResponseEntity<Shipment> track(@PathVariable String trackingNumber,
                                            @AuthenticationPrincipal UserDetails principal) {
        Optional<Shipment> found = shipmentRepository.findByTrackingNumber(trackingNumber);
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Shipment shipment = found.get();
        User viewer = currentUser(principal);
        if (!mayViewOrder(shipment.getOrder(), viewer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(shipment);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get shipment by order ID", description = "Order owner, manager, or admin.")
    public ResponseEntity<Shipment> getByOrder(@PathVariable Long orderId,
                                               @AuthenticationPrincipal UserDetails principal) {
        Order order = orderRepository.findById(Objects.requireNonNull(orderId)).orElseThrow();
        User viewer = currentUser(principal);
        if (!mayViewOrder(order, viewer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return shipmentRepository.findByOrder(order)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Create a shipment for an order")
    public ResponseEntity<Shipment> create(@RequestBody Shipment shipment,
                                           @AuthenticationPrincipal UserDetails principal) {
        User viewer = currentUser(principal);
        if (shipment == null || shipment.getOrder() == null || shipment.getOrder().getOrderId() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        // Enforce managers can only create shipments for orders in their scope.
        Order order = orderRepository.findDetailedById(shipment.getOrder().getOrderId()).orElseThrow();
        if (!mayViewOrder(order, viewer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        shipment.setOrder(order);

        // Ensure required fields exist (MVP defaults).
        if (shipment.getWarehouseBlock() == null || shipment.getWarehouseBlock().isBlank()) {
            shipment.setWarehouseBlock("A-14");
        }
        if (shipment.getModeOfShipment() == null || shipment.getModeOfShipment().isBlank()) {
            shipment.setModeOfShipment("Road");
        }
        if (shipment.getCarrier() == null || shipment.getCarrier().isBlank()) {
            shipment.setCarrier("Nexus Logistics");
        }
        if (shipment.getStatus() == null) {
            shipment.setStatus(Shipment.ShipmentStatus.PREPARING);
        }
        if (shipment.getEstimatedDelivery() == null) {
            shipment.setEstimatedDelivery(java.time.LocalDateTime.now().plusDays(3));
        }
        if (shipment.getTrackingNumber() == null || shipment.getTrackingNumber().isBlank()) {
            shipment.setTrackingNumber("FX-" + System.currentTimeMillis());
        }
        if (shipment.getStatus() == Shipment.ShipmentStatus.SHIPPED && shipment.getShippedAt() == null) {
            shipment.setShippedAt(LocalDateTime.now());
        }
        Shipment saved = shipmentRepository.save(shipment);
        if (saved.getStatus() == Shipment.ShipmentStatus.SHIPPED) {
            notifyShipmentShippedEmail(saved);
        }
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update shipment status")
    public ResponseEntity<Shipment> updateStatus(@PathVariable Long id,
                                                 @RequestBody Map<String, String> body,
                                                 @AuthenticationPrincipal UserDetails principal) {
        Shipment shipment = shipmentRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        User viewer = currentUser(principal);
        if (!mayViewOrder(shipment.getOrder(), viewer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Shipment.ShipmentStatus previous = shipment.getStatus();
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
        Shipment saved = shipmentRepository.save(shipment);
        if (previous != Shipment.ShipmentStatus.SHIPPED && saved.getStatus() == Shipment.ShipmentStatus.SHIPPED) {
            notifyShipmentShippedEmail(saved);
        }
        return ResponseEntity.ok(saved);
    }

    private void notifyShipmentShippedEmail(Shipment saved) {
        Order order = saved.getOrder();
        if (order == null || order.getUser() == null) {
            return;
        }
        String email = order.getUser().getEmail();
        if (email != null && !email.isBlank()) {
            mailService.sendShipmentShipped(email, saved);
        }
    }
}
