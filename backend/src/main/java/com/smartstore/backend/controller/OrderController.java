package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.OrderItem;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.Role;
import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all orders (admin)", description = "Returns every order in the system. Admin only.")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/my")
    @Operation(summary = "List orders for the current user")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findByUser(user));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Order owner or admin only.")
    public ResponseEntity<Order> getOrder(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails principal) {
        Optional<Order> found = orderRepository.findById(Objects.requireNonNull(id));
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = found.get();
        User current = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (current.getRole() != Role.ADMIN
                && !order.getUser().getUserId().equals(current.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(order);
    }

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates an order for the authenticated user and decrements product stock.")
    public ResponseEntity<Order> createOrder(@RequestBody Order order,
                                             @AuthenticationPrincipal UserDetails principal) {
        User buyer = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        order.setUser(buyer);

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findById(
                        Objects.requireNonNull(item.getProduct().getProductId())).orElseThrow();
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for " + product.getName()
                                    + " (available: " + product.getStockQuantity()
                                    + ", requested: " + item.getQuantity() + ")");
                }
                product.setStockQuantity(stock - item.getQuantity());
                productRepository.save(product);
                item.setOrder(order);
            }
        }
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update order status", description = "Admin or store manager.")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Order order = orderRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        order.setStatus(Order.OrderStatus.valueOf(newStatus.toUpperCase()));
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
