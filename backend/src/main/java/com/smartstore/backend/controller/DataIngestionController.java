package com.smartstore.backend.controller;

import com.smartstore.backend.service.DataIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/ingest")
@RequiredArgsConstructor
@Tag(name = "Data Ingestion", description = "Admin-only endpoints for importing DS4, DS5, and DS6 datasets")
public class DataIngestionController {

    private final DataIngestionService ingestionService;

    @PostMapping("/products-ds4")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ingest DS4 Products", description = "Import electronics catalog from Amazon DS4 CSV.")
    public ResponseEntity<String> ingestProducts(@RequestParam("file") MultipartFile file) {
        try {
            ingestionService.importProductsFromDS4(file.getInputStream());
            return ResponseEntity.ok("DS4 Products ingested successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to ingest DS4: " + e.getMessage());
        }
    }

    @PostMapping("/inventory-ds5")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ingest DS5 Inventory", description = "Import regional logistics data from Pakistan DS5 CSV.")
    public ResponseEntity<String> ingestInventory(@RequestParam("file") MultipartFile file) {
        try {
            ingestionService.importInventoryFromDS5(file.getInputStream());
            return ResponseEntity.ok("DS5 Inventory ingested successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to ingest DS5: " + e.getMessage());
        }
    }

    @PostMapping("/reviews-ds6")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Ingest DS6 Reviews", description = "Import consumer reviews and sentiment data from Amazon US DS6 CSV.")
    public ResponseEntity<String> ingestReviews(@RequestParam("file") MultipartFile file) {
        try {
            ingestionService.importReviewsFromDS6(file.getInputStream());
            return ResponseEntity.ok("DS6 Reviews ingested successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to ingest DS6: " + e.getMessage());
        }
    }
}
