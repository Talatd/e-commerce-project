package com.smartstore.backend.controller;

import com.smartstore.backend.model.Store;
import com.smartstore.backend.repository.StoreRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Tag(name = "Stores", description = "Store management endpoints")
public class StoreController {

    private final StoreRepository storeRepository;

    @GetMapping
    @Operation(summary = "List all stores")
    public ResponseEntity<List<Store>> getAllStores() {
        return ResponseEntity.ok(storeRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Create a store")
    public ResponseEntity<Store> createStore(@RequestBody Store store) {
        return ResponseEntity.ok(storeRepository.save(store));
    }
}
