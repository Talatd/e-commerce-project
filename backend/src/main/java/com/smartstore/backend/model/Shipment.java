package com.smartstore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    @JsonIgnoreProperties({"items", "user"})
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
    private ShipmentStatus status = ShipmentStatus.PREPARING;

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

    /** Values must match MySQL ENUM on shipments.status (see database/schema.sql). */
    public enum ShipmentStatus {
        PREPARING, SHIPPED, IN_TRANSIT, DELIVERED, RETURNED
    }
}
