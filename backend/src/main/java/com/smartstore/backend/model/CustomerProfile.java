package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "customer_profiles", indexes = {
    @Index(name = "idx_cp_user", columnList = "user_id"),
    @Index(name = "idx_cp_membership", columnList = "membershipType"),
    @Index(name = "idx_cp_city", columnList = "city")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String gender;
    private Integer age;
    private String city;
    private String country;

    @Column(nullable = false)
    private String membershipType = "Bronze"; // Bronze, Silver, Gold, Premium

    private BigDecimal totalSpend = BigDecimal.ZERO;
    private Integer itemsPurchased = 0;
    private Double avgRating;
    private Boolean discountApplied = false;

    @Column(nullable = false)
    private String satisfactionLevel = "Neutral"; // Unsatisfied, Neutral, Satisfied

    private String preferredPaymentMethod;
    private Integer daysOnPlatform = 0;
}
