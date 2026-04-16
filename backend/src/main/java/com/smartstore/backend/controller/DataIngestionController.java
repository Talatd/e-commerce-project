package com.smartstore.backend.controller;

import com.smartstore.backend.service.DataIngestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/ingest")
@RequiredArgsConstructor
public class DataIngestionController {

    private final DataIngestionService ingestionService;

    @PostMapping("/products-ds4")
    @PreAuthorize("hasRole('ADMIN')")
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
    public ResponseEntity<String> ingestReviews(@RequestParam("file") MultipartFile file) {
        try {
            ingestionService.importReviewsFromDS6(file.getInputStream());
            return ResponseEntity.ok("DS6 Reviews ingested successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to ingest DS6: " + e.getMessage());
        }
    }
}
