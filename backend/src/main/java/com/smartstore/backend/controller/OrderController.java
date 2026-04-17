package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:4200")
@lombok.RequiredArgsConstructor
public class OrderController {
    
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody @org.springframework.lang.NonNull Order order) {
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
