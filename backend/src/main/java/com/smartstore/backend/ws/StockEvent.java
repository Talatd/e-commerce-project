package com.smartstore.backend.ws;

public record StockEvent(
        Long productId,
        Integer stockQuantity,
        Integer delta,
        String reason,
        String changedBy,
        Long at
) {
}

