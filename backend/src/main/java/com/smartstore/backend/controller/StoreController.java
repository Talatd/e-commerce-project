package com.smartstore.backend.controller;

import com.smartstore.backend.model.Store;
import com.smartstore.backend.dto.StoreAdminView;
import com.smartstore.backend.dto.UpdateStoreStatusRequest;
import com.smartstore.backend.repository.StoreRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Store management endpoints")
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all stores")
    public ResponseEntity<List<StoreAdminView>> getAllStores() {
        return ResponseEntity.ok(storeRepository.findAllAdminViews());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a store")
    @SuppressWarnings("null")
    public ResponseEntity<Store> createStore(@RequestBody Store store) {
        return ResponseEntity.ok(storeRepository.save(store));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update store status", description = "Set store status to OPEN or CLOSED.")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody UpdateStoreStatusRequest req) {
        if (id == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(
                    "message", "Missing store id"
            ));
        }
        String status = req != null && req.status() != null ? req.status().trim().toUpperCase() : "";
        if (!status.equals("OPEN") && !status.equals("CLOSED")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of(
                    "message", "Invalid status. Use OPEN or CLOSED."
            ));
        }

        Store store = storeRepository.findById(id).orElse(null);
        if (store == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(java.util.Map.of(
                    "message", "Store not found"
            ));
        }
        store.setStatus(status);
        storeRepository.save(store);
        return ResponseEntity.ok(java.util.Map.of("success", true, "status", status));
    }
}
