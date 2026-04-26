package com.smartstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category"),
    @Index(name = "idx_product_brand", columnList = "brand"),
    @Index(name = "idx_product_name", columnList = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String name;

    private String description;
    private String brand;
    private String category;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    @Column(nullable = false)
    private BigDecimal basePrice;

    @DecimalMin(value = "0.0", inclusive = false, message = "Supplier price must be greater than zero")
    private BigDecimal supplierPrice;

    private String imageUrl;

    @Builder.Default
    private Integer stockQuantity = 0;
    private String tags;

    /**
     * Deterministic bundle system fields (seeded via ETL).
     * - bundleRole: "ANCHOR" or "ACCESSORY"
     * - compatibleWith: comma-separated list of anchor categories this product complements (or "ANY")
     */
    private String bundleRole;
    private String compatibleWith;
    /**
     * Optional deterministic ordering for bundle suggestions.
     * Smaller rank is higher priority. If bundleRankByAnchor is set, it can override bundleRank per anchor category.
     */
    private Integer bundleRank;
    /** JSON map: {"Keyboards": 10, "Audio": 20, "ANY": 999} */
    private String bundleRankByAnchor;

    /**
     * Stable key used by ETL to define deterministic bundles.
     * - seedKey: unique string identifier per seeded product (e.g. "kbd_stealth_tkl")
     * - bundleIncludes: comma-separated seedKeys in desired order (only meaningful for ANCHOR products)
     */
    private String seedKey;
    private String bundleIncludes;

    @Builder.Default
    private Double rating = 0.0;
    
    @Builder.Default
    private Integer reviewCount = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "store_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Store store;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<RegionalInventory> regionalInventories = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductSpecification> specifications = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ShippingInfo shippingInfo;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
