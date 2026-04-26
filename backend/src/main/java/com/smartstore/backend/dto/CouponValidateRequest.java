package com.smartstore.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CouponValidateRequest {
    private String code;
    /** Optional: subtotal to compute discount amount for the UI. */
    private BigDecimal subtotal;
}

