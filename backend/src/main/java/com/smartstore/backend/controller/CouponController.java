package com.smartstore.backend.controller;

import com.smartstore.backend.dto.CouponValidateRequest;
import com.smartstore.backend.dto.CouponValidateResponse;
import com.smartstore.backend.model.Coupon;
import com.smartstore.backend.repository.CouponRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon validation endpoints")
public class CouponController {

    private final CouponRepository couponRepository;

    @PostMapping("/validate")
    @Operation(summary = "Validate a coupon code", description = "Validates code and optionally computes discount amount for a given subtotal.")
    public ResponseEntity<CouponValidateResponse> validate(@RequestBody CouponValidateRequest req) {
        String raw = req.getCode() == null ? "" : req.getCode().trim();
        if (raw.isEmpty()) {
            return ResponseEntity.ok(new CouponValidateResponse(false, null, null, BigDecimal.ZERO, "Coupon code is required"));
        }
        Coupon c = couponRepository.findByCodeIgnoreCase(raw).orElse(null);
        if (c == null || c.getActive() == null || !c.getActive()) {
            return ResponseEntity.ok(new CouponValidateResponse(false, raw.toUpperCase(), null, BigDecimal.ZERO, "Invalid coupon"));
        }
        if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ResponseEntity.ok(new CouponValidateResponse(false, c.getCode().toUpperCase(), c.getPercentOff(), BigDecimal.ZERO, "Coupon expired"));
        }
        int pct = c.getPercentOff() == null ? 0 : Math.max(0, Math.min(100, c.getPercentOff()));
        BigDecimal subtotal = req.getSubtotal() == null ? BigDecimal.ZERO : req.getSubtotal().max(BigDecimal.ZERO);
        BigDecimal disc = subtotal.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return ResponseEntity.ok(new CouponValidateResponse(true, c.getCode().toUpperCase(), pct, disc, "Coupon applied"));
    }
}

