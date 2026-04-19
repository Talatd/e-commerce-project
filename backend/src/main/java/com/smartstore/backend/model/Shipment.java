package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments", indexes = {
    @Index(name = "idx_shipment_order", columnList = "order_id"),
    @Index(name = "idx_shipment_tracking", columnList = "trackingNumber"),
    @Index(name = "idx_shipment_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shipmentId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false)
    private String warehouseBlock;

    @Column(nullable = false)
    private String modeOfShipment; // Ship, Flight, Road

    private String carrier;

    @Column(unique = true)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipmentStatus status = ShipmentStatus.PROCESSING;

    private Integer customerCareCalls = 0;
    private Integer customerRating;
    private Integer priorPurchases = 0;
    private Boolean onTimeDelivery;

    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDelivery;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ShipmentStatus {
        PROCESSING, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED
    }
}
