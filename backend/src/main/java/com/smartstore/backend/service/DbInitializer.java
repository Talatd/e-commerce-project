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
import java.util.Objects;

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
        
        // Force clean start for Curated Experience transition
        System.out.println("SEED: Performing clean sweep (Products, Stores, Users)...");
        productRepository.deleteAll();
        inventoryRepository.deleteAll();
        storeRepository.deleteAll();
        userRepository.deleteAll();

        if (productRepository.count() == 0) {
            seedCuratedProducts();
        }
        
        if (storeRepository.count() == 0) {
            seedStores();
        }
        seedUsers();
        System.out.println("SEED: Initialization complete.");
    }

    private void seedCuratedProducts() {
        List<Product> products = new ArrayList<>();

        // Setup 1: Minimalist (The Clean Slate)
        products.add(createProduct("Stealth-Key TKL Mechanical Keyboard", "Peripherals", "Keychron", 129.00, 
            "Silent tactile switches with deep black PBT keycaps. Perfect for late-night coding sessions.", 
            "/products/mechanical-keyboard.png", "Minimalist, Silent, Work"));

        products.add(createProduct("Precision Flow MX Mouse", "Peripherals", "Logitech", 99.00, 
            "High-precision ergonomic mouse with MagSpeed scrolling and multi-device support.", 
            "/products/precision-mouse.png", "Productivity, Performance, Minimalist"));

        products.add(createProduct("FocusBar Monitor Light", "Accessories", "BenQ", 149.00, 
            "Eye-care screen bar with auto-dimming and asymmetric optical design to reduce glare.", 
            "/products/monitor-light.png", "Aesthetic, Productivity, Work"));

        // Setup 2: Creative Studio
        products.add(createProduct("Orbit Walnut Vinyl Player", "Audio", "Audio-Technica", 450.00, 
            "Minimalist walnut plinth with professional-grade tonearm and cartridge for pure analog sound.", 
            "/products/vinyl-player.png", "Aesthetic, Audio, Design"));

        products.add(createProduct("Foundry Brass Studio Microphone", "Audio", "Shure", 399.00, 
            "Vintage-inspired brass finish with modern XLR condenser technology for rich, warm vocals.", 
            "/products/studio-mic.png", "Audio, Aesthetic, Professional"));

        // Setup 3: Overkill/Unique
        products.add(createProduct("Gravity Floating Kinetic Pen", "Accessories", "Novium", 85.00, 
            "A magnetically suspended pen that rotates at a 23.5 degree angle. A masterpiece of physics.", 
            "/products/gravity-pen.png", "Design, Aesthetic, Productivity"));

        products.add(createProduct("Nanobag Ultra Pouch", "Travel", "Peak Design", 45.00, 
            "Waterproof, palm-sized tech organizer for cables, SD cards, and power banks.", 
            "/products/tech-pouch.png", "Travel, Minimalist, Productivity"));

        List<Product> saved = productRepository.saveAll(products);
        
        for (Product p : saved) {
            RegionalInventory inv = new RegionalInventory();
            inv.setProduct(p);
            inv.setRegion("Global");
            inv.setStockQuantity(50);
            inventoryRepository.save(inv);
        }
    }

    private void seedStores() {
        Store s1 = Store.builder().name("Nexus Admin Hub").ownerName("Nexus System").totalRevenue(500000.0).orderCount(12000).rating(5.0).status("OPEN").build();
        Store s2 = Store.builder().name("TechHub Professional").ownerName("Marcus Chen").totalRevenue(285000.0).orderCount(4500).rating(4.8).status("OPEN").build();
        Store s3 = Store.builder().name("GadgetPro & Lifestyle").ownerName("Elena Rodriguez").totalRevenue(195000.0).orderCount(2800).rating(4.9).status("OPEN").build();
        storeRepository.save(Objects.requireNonNull(s1));
        storeRepository.save(Objects.requireNonNull(s2));
        storeRepository.save(Objects.requireNonNull(s3));
    }

    private void seedUsers() {
        updateOrSaveUser("Nexus Admin", "admin@nexus.io", "admin123", Role.ADMIN);
        updateOrSaveUser("Marcus Chen", "marcus@techhub.pro", "manager123", Role.MANAGER);
        updateOrSaveUser("Elena Rodriguez", "elena@gadgetpro.co", "manager123", Role.MANAGER);
        updateOrSaveUser("Daniel Smith", "daniel@nexus.io", "user123", Role.CONSUMER);
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
    }

    private Product createProduct(String name, String cat, String brand, double price, String desc, String img, String tags) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setBasePrice(BigDecimal.valueOf(price));
        p.setDescription(desc);
        p.setImageUrl(img);
        p.setTags(tags);
        return p;
    }
}
