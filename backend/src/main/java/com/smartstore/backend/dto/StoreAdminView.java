package com.smartstore.backend.dto;

import java.math.BigDecimal;

public record StoreAdminView(
        Long id,
        String name,
        String ownerName,
        Long ownerId,
        Double rating,
        String status,
        BigDecimal totalRevenue,
        Long orderCount
) {}

