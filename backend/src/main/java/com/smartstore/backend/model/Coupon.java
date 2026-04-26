package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", indexes = {
        @Index(name = "idx_coupon_code", columnList = "code", unique = true),
        @Index(name = "idx_coupon_active", columnList = "active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    /** Percent off (0-100). Example: 20 -> 20% */
    @Column(nullable = false)
    private Integer percentOff;

    @Column(nullable = false)
    private Boolean active = true;

    /** If set, coupon only applies to products in this category. */
    private String restrictedCategory;

    /** If set, coupon is invalid after this date/time. */
    private LocalDateTime expiresAt;
}

