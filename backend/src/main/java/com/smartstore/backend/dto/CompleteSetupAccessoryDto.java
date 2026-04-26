package com.smartstore.backend.dto;

import java.math.BigDecimal;

public record CompleteSetupAccessoryDto(
        Long productId,
        String name,
        String category,
        String brand,
        String imageUrl,
        BigDecimal basePrice,
        BigDecimal oldPrice,
        String why,
        String compatBadge,
        Integer rank,
        String accent
) {
}

