package com.smartstore.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record CompleteSetupBundleDto(
        Long anchorProductId,
        String anchorName,
        String anchorCategory,
        String anchorBrand,
        String anchorImageUrl,
        BigDecimal anchorPrice,
        List<String> compatBadges,
        BigDecimal maxSave,
        List<CompleteSetupAccessoryDto> accessories
) {
}

