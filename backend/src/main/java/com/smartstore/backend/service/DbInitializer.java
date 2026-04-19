package com.smartstore.backend.service;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.RegionalInventory;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.RegionalInventoryRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.repository.UserRepository;
import com.smartstore.backend.model.Store;
import com.smartstore.backend.model.User;
import com.smartstore.backend.model.Role;
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
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @jakarta.annotation.PostConstruct
    @jakarta.transaction.Transactional
    public void init() {
        System.out.println("SEED: Initializing database checks...");
        System.out.println("SEED: Product count: " + productRepository.count());
        if (productRepository.count() < 10) {
            seedSmartwatches();
        }
        System.out.println("SEED: Store count: " + storeRepository.count());
        if (storeRepository.count() == 0) {
            seedStores();
        }
        seedUsers();
        System.out.println("SEED: Initialization complete.");
    }

    private void seedSmartwatches() {
        List<Product> watches = new ArrayList<>();

        watches.add(createProduct("Nexus Pro Laptop", "Computers", "Nexus", 1499.00, 
            "High-end minimalist laptop with titanium chassis and 4K display.", 
            "nexus_pro_laptop_1776548252741.png"));

        watches.add(createProduct("Nexus Smartphone X", "Mobile", "Nexus", 999.00, 
            "Ultimate mobile experience with edge-to-edge OLED and triple lens system.", 
            "nexus_smartphone_1776548329975.png"));

        watches.add(createProduct("Nexus Sound Pro", "Audio", "Nexus", 349.00, 
            "Studio-grade noise cancelling headphones with deep bass and crystal clear highs.", 
            "nexus_headphones_1776548345133.png"));

        watches.add(createProduct("Nexus Watch Pro", "Wearables", "Nexus", 299.99, 
            "Professional titanium smartwatch with sapphire glass and health tracking.", 
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

    @SuppressWarnings("null")
    private void seedStores() {
        storeRepository.save(Store.builder().name("Nexus Main Store").ownerName("Admin").totalRevenue(427000.0).orderCount(6421).rating(4.9).status("OPEN").build());
        storeRepository.save(Store.builder().name("TechHub Store").ownerName("James Wilson").totalRevenue(218000.0).orderCount(3104).rating(4.7).status("OPEN").build());
        storeRepository.save(Store.builder().name("GadgetPro").ownerName("Sarah Miller").totalRevenue(142000.0).orderCount(2089).rating(4.8).status("OPEN").build());
    }

    @SuppressWarnings("null")
    private void seedUsers() {
        updateOrSaveUser("Buse Ünal", "buse@akdeniz.edu.tr", "admin123", Role.ADMIN);
        updateOrSaveUser("James Wilson", "james@techhub.com", "manager123", Role.MANAGER);
        updateOrSaveUser("Manager User", "manager@nexus.com", "manager123", Role.MANAGER);
        updateOrSaveUser("Elif Buse", "elif@akdeniz.edu.tr", "user123", Role.CONSUMER);
    }

    private void updateOrSaveUser(String name, String email, String pass, Role role) {
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User u = new User();
            u.setEmail(email);
            return u;
        });
        user.setFullName(name);
        user.setRole(role);
        user.setEnabled(true);

        if (pass.startsWith("$2a$")) {
            user.setPasswordHash(pass);
        } else {
            user.setPasswordHash(passwordEncoder.encode(pass));
        }
        
        userRepository.save(user);
        System.out.println("SEED: Synchronized user " + email);
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
