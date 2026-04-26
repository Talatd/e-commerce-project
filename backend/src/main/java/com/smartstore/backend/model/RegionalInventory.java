package com.smartstore.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "regional_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@lombok.Builder
public class RegionalInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnore
    private Product product;

    @Column(nullable = false)
    private String region; // US, PK, EU

    @Column(nullable = false)
    @lombok.Builder.Default
    private Integer stockQuantity = 0;
}
