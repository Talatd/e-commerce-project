package com.smartstore.backend.service;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.RegionalInventory;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.RegionalInventoryRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DbInitializer {

    private final ProductRepository productRepository;
    private final RegionalInventoryRepository inventoryRepository;

    @PostConstruct
    public void init() {
        if (productRepository.count() < 10) {
            seedSmartwatches();
        }
    }

    private void seedSmartwatches() {
        List<Product> watches = new ArrayList<>();

        watches.add(createProduct("Nexus Watch Pro", "Electronics", "Nexus", 299.99, 
            "Professional titanium smartwatch with sapphire glass and advanced health tracking.", 
            "/products/nexus_watch_pro.png"));

        watches.add(createProduct("Nexus Sync S", "Electronics", "Nexus", 249.99, 
            "Elegant lifestyle smartwatch with mesh strap and customizable floral displays.", 
            "/products/nexus_sync_s.png"));

        watches.add(createProduct("Nexus Active X", "Electronics", "Nexus", 199.99, 
            "Rugged sports watch with GPS, heart rate monitor, and cyber lime accents.", 
            "/products/nexus_active_x.png"));
            
        watches.add(createProduct("Nexus Aura", "Electronics", "Nexus", 349.99, 
            "Minimalist ceramic smartwatch with always-on AMOLED display.", 
            "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=400"));

        List<Product> saved = productRepository.saveAll(watches);
        
        // Add basic inventory
        for (Product p : saved) {
            RegionalInventory inv = new RegionalInventory();
            inv.setProduct(p);
            inv.setRegion("Global");
            inv.setStockQuantity(100);
            inventoryRepository.save(inv);
        }
    }

    private Product createProduct(String name, String cat, String brand, double price, String desc, String img) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setBasePrice(BigDecimal.valueOf(price));
        p.setDescription(desc);
        p.setImageUrl(img);
        return p;
    }
}
