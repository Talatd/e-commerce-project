package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.OrderItem;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping
    @Operation(summary = "List all orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return orderRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates an order and decrements product stock.")
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = productRepository.findById(item.getProduct().getProductId()).orElseThrow();
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for " + product.getName()
                                    + " (available: " + product.getStockQuantity()
                                    + ", requested: " + item.getQuantity() + ")");
                }
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productRepository.save(product);
                item.setOrder(order);
            }
        }
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Advances or changes the status of an order.")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Order order = orderRepository.findById(id).orElseThrow();
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        order.setStatus(Order.OrderStatus.valueOf(newStatus.toUpperCase()));
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
