package com.smartstore.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private String code;
    private Integer percentOff;
    private BigDecimal discountAmount;
    private String message;
}

