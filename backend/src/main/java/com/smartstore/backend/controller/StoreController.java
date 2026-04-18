package com.smartstore.backend.controller;

import com.smartstore.backend.model.Store;
import com.smartstore.backend.repository.StoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
@CrossOrigin(origins = "*")
public class StoreController {

    @Autowired
    private StoreRepository storeRepository;

    @GetMapping
    @SuppressWarnings("null")
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @PostMapping
    @SuppressWarnings("null")
    public Store createStore(@RequestBody Store store) {
        return storeRepository.save(store);
    }
}
