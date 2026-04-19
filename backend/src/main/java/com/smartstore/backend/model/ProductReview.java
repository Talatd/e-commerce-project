package com.smartstore.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews", indexes = {
    @Index(name = "idx_review_product", columnList = "product_id"),
    @Index(name = "idx_review_user", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Min(1) @Max(5)
    private Integer rating;

    @Column(length = 2000)
    private String comment;

    @Column(precision = 3, scale = 2)
    private BigDecimal sentimentScore; // AI tabanlı duygu skoru

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
