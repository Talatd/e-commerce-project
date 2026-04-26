package com.smartstore.backend.controller;

import com.smartstore.backend.dto.CompleteSetupBundleDto;
import com.smartstore.backend.service.CompleteSetupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/bundles")
@RequiredArgsConstructor
@Tag(name = "Bundles", description = "Product-specific bundle recommendations")
public class BundleController {

    private final CompleteSetupService completeSetupService;

    @GetMapping("/complete-setup")
    @Operation(summary = "Complete setup bundle", description = "Returns accessories recommended for an anchor product.")
    public ResponseEntity<CompleteSetupBundleDto> completeSetup(@RequestParam Long anchorProductId) {
        return ResponseEntity.ok(completeSetupService.buildBundle(anchorProductId));
    }
}

