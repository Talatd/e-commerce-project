package com.smartstore.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String ownerName;
    private Double totalRevenue;
    private Integer orderCount;
    private Double rating;
    private String status; // OPEN, CLOSED
}
