package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Builder
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
    @Builder.Default
    private String membershipType = "Bronze"; // Bronze, Silver, Gold, Premium

    @Builder.Default
    private BigDecimal totalSpend = BigDecimal.ZERO;
    @Builder.Default
    private Integer itemsPurchased = 0;
    private Double avgRating;
    @Builder.Default
    private Boolean discountApplied = false;

    @Column(nullable = false)
    @Builder.Default
    private String satisfactionLevel = "Neutral"; // Unsatisfied, Neutral, Satisfied

    private String preferredPaymentMethod;
    private String preferredStyle;
    private String personaType;
    private String bio;
    private String ageRange; // e.g., "25-34"
    private String occupation; // e.g., "Software Engineer"
    private String interests; // e.g., "Mechanical Keyboards, Minimalist Setups"
    private String persona; // e.g., "Shadow Coder", "Organic Creator"
    private String membershipHistory; // Log of status changes

    @Builder.Default
    private Integer daysOnPlatform = 0;
}
