package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false, length = 25)
    private String status; // PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED

    @Column(nullable = false)
    private LocalDateTime eventDate;

    private String notes;
}
