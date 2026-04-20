package com.smartstore.backend.service;

import com.smartstore.backend.repository.*;
import com.smartstore.backend.model.*;
import com.smartstore.backend.model.Order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DbInitializer {

    private final ProductRepository productRepository;
    private final RegionalInventoryRepository inventoryRepository;
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductReviewRepository reviewRepository;
    private final AuditLogRepository auditLogRepository;
    private final CustomerProfileRepository profileRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @jakarta.annotation.PostConstruct
    @jakarta.transaction.Transactional
    public void init() {
        if (userRepository.count() == 0 || storeRepository.count() == 0) {
            seedUsersAndStores();
        }

        if (productRepository.count() == 0) {
            seedCuratedProducts();
        }

        if (orderRepository.count() == 0) {
            seedHistoricalData();
        }
        System.out.println("SEED: Initialization complete.");
    }

    @SuppressWarnings("all")
    private void seedHistoricalData() {
        System.out.println("SEED: Generating historical analytics data...");
        seedAuditLogs();
        seedCustomerReviews();
        seedHistoricalOrders();
    }

    @SuppressWarnings("all")
    private void seedAuditLogs() {
        auditLogRepository.save(AuditLog.builder().username("system").action("MARKETPLACE_INITIALIZED").type("SYSTEM").detail("Marketplace core services started").build());
        auditLogRepository.save(AuditLog.builder().username("marcus@techhub.pro").action("STORE_OPENED").type("STORE").detail("TechHub Performance store is now live").build());
        auditLogRepository.save(AuditLog.builder().username("elena@gadgetpro.co").action("STORE_OPENED").type("STORE").detail("GadgetPro Lifestyle store is now live").build());
        auditLogRepository.save(AuditLog.builder().username("marcus@techhub.pro").action("PRODUCT_ADDED").type("INVENTORY").detail("VANGUARD Stealth-Key added to catalog").build());
    }

    private void seedCustomerReviews() {
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findByRole(Role.CONSUMER);
        if (products.isEmpty() || users.isEmpty()) return;

        String[] comments = {
            "This setup literally changed my workflow. The build quality of VANGUARD is unmatched.",
            "Absolutely stunning aesthetic. It perfectly fits my Organic Creator vibe.",
            "A bit expensive, but the AURA kinetic pen is a masterpiece of engineering. Worth every penny.",
            "Minimalist perfection. Fast shipping and the packaging was premium too.",
            "The noise canceling is insane. I can finally code in peace at the coffee shop.",
            "Great connectivity on the NOVA hub. Solid build, feels very premium in hand.",
            "The walnut finish is so warm. My desk feels alive now.",
            "I'm obsessed with the floating desk lamp. Everyone who visits asks about it!"
        };

        for (int i = 0; i < 40; i++) {
            ProductReview review = new ProductReview();
            review.setProduct(products.get(i % products.size()));
            review.setUser(users.get(i % users.size()));
            review.setRating(4 + (i % 2)); // 4 or 5 stars
            review.setComment(comments[i % comments.length]);
            review.setSentimentScore(java.math.BigDecimal.valueOf(0.85 + (i * 0.003) % 0.15));
            review.setCreatedAt(java.time.LocalDateTime.now().minusDays(i * 3));
            reviewRepository.save(review);
        }
    }

    private void seedHistoricalOrders() {
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findByRole(Role.CONSUMER);
        if (products.isEmpty() || users.isEmpty()) return;

        Random random = new Random();
        
        for (int i = 0; i < 60; i++) {
            Order order = new Order();
            order.setUser(users.get(random.nextInt(users.size())));
            order.setShippingAddress("123 Tech Lane, San Francisco, CA");
            order.setOrderDate(java.time.LocalDateTime.now().minusDays(random.nextInt(180)));
            
            // Randomly set status based on age
            if (i < 50) order.setStatus(OrderStatus.DELIVERED);
            else if (i < 55) order.setStatus(OrderStatus.SHIPPED);
            else order.setStatus(OrderStatus.PROCESSING);

            List<OrderItem> items = new java.util.ArrayList<>();
            java.math.BigDecimal total = java.math.BigDecimal.ZERO;

            // 1-3 items per order
            int itemCount = 1 + random.nextInt(3);
            for (int j = 0; j < itemCount; j++) {
                Product p = products.get(random.nextInt(products.size()));
                OrderItem item = new OrderItem();
                item.setOrder(order);
                item.setProduct(p);
                item.setQuantity(1);
                item.setPriceAtPurchase(p.getBasePrice());
                items.add(item);
                total = total.add(p.getBasePrice());
            }

            order.setItems(items);
            order.setTotalAmount(total);
            orderRepository.save(order);
        }
    }

    private void seedCuratedProducts() {
        List<Product> products = new ArrayList<>();
        
        Store techHub = storeRepository.findByName("TechHub Performance").orElseThrow();
        Store gadgetPro = storeRepository.findByName("GadgetPro Lifestyle").orElseThrow();

        // Persona: The Shadow Coder (Performance & Stealth) -> TECHHUB (Marcus)
        products.add(createProduct("Stealth-Key TKL Mechanical Keyboard", "Shadow Coder", "VANGUARD", 189.00, 
            "Matte finish, silent tactile switches, and carbon fiber reinforcement. Designed for total immersion.", 
            "products/shadow-coder-keyboard.png", "Shadow Coder, Stealth, Performance Monster", techHub));
        
        products.add(createProduct("Precision Flow MX Mouse", "Shadow Coder", "VANGUARD", 119.00, 
            "Ultra-low latency with graphite matte texture. Ergonomics meet extreme performance.", 
            "products/precision-flow-mouse.png", "Shadow Coder, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("FocusBar Monitor Light", "Shadow Coder", "VANGUARD", 159.00, 
            "Asymmetric optical design to eliminate screen glare. Essential for night coding sessions.", 
            "products/focusbar-light.png", "Shadow Coder, Night Work Approved, Setup Essential", techHub));
        
        products.add(createProduct("Apex Carbon Desk Mat", "Shadow Coder", "VANGUARD", 75.00, 
            "Large-scale desk pad with woven carbon fibers for maximum mouse glide precision.", 
            "products/apex-desk-mat.png", "Shadow Coder, Stealth, Performance Monster", techHub));

        products.add(createProduct("Onyx Dual Monitor Arm", "Shadow Coder", "VANGUARD", 245.00, 
            "Heavy-duty matte black dual arm with integrated cable management. Clean desk peak.", 
            "products/onyx-monitor-arm.png", "Shadow Coder, Stealth, Setup Essential", techHub));

        // Persona: The Organic Creator (Aesthetic & Natural) -> GADGETPRO (Elena)
        products.add(createProduct("Orbit Walnut Vinyl Player", "Organic Creator", "LOOM & LEAF", 495.00, 
            "Minimalist walnut plinth with professional-grade tonearm. Analog soul for digital creators.", 
            "products/walnut-vinyl-player.png", "Organic Creator, Aesthetic Peak, Hidden Gem", gadgetPro));
        
        products.add(createProduct("Foundry Brass Studio Microphone", "Organic Creator", "LOOM & LEAF", 425.00, 
            "Vintage-inspired brass finish with modern XLR condenser technology. Rich, warm vocals.", 
            "products/foundry-brass-mic.png", "Organic Creator, Aesthetic Peak, Creative Beast", gadgetPro));
        
        products.add(createProduct("Heritage Headphone Stand", "Organic Creator", "LOOM & LEAF", 115.00, 
            "Solid oak wood with a brushed brass base. The perfect resting place for premium audio gear.", 
            "products/heritage-headphone-stand.png", "Organic Creator, Aesthetic Peak, Setup Essential", gadgetPro));
        
        products.add(createProduct("Loom Felt Desk Pad", "Organic Creator", "LOOM & LEAF", 65.00, 
            "Soft light-grey wool felt with genuine leather accents. Comfort for the creative tactile soul.", 
            "products/loom-felt-desk-pad.png", "Organic Creator, Aesthetic Peak, Setup Essential", gadgetPro));

        // Persona: The Discovery (Oddities & Kinetic Art) -> GADGETPRO (Elena)
        products.add(createProduct("Gravity Floating Kinetic Pen", "Discovery", "AURA", 95.00, 
            "A magnetically suspended pen that rotates at a 23.5 degree angle. A masterpiece of physics.", 
            "products/gravity-kinetic-pen.png", "Discovery, Conversation Starter, Weird but Useful", gadgetPro));
        
        products.add(createProduct("Heng Balance Magnetic Lamp", "Discovery", "AURA", 125.00, 
            "Unique lamp where two magnetic wooden balls act as the power switch. Award-winning design.", 
            "products/heng-balance-magnetic-lamp.png", "Discovery, Conversation Starter, Aesthetic Peak", gadgetPro));
        
        products.add(createProduct("Ferrofluid Music Visualizer", "Discovery", "AURA", 195.00, 
            "A glass ferrofluid speaker with black liquid reacting to the rhythm of sound.", 
            "products/ferrofluid-music-visualizer.png", "Discovery, Conversation Starter, Weird but Useful", gadgetPro));

        // Persona: The Global Nomad (Travel & Mobility) -> TECHHUB (Marcus)
        products.add(createProduct("Nova GaN Travel Adapter", "Global Nomad", "NOVA", 89.00, 
            "Ultra-slim 100W multi-country adapter with 3x USB-C ports. The only power block you need.", 
            "products/vanguard-gan-world-adapter.png", "Global Nomad, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("Cyber Tech Pouch Pro", "Global Nomad", "NOVA", 65.00, 
            "Waterproof origami-style organizer for cables, drives, and tools. Rugged luxury travel kit.", 
            "products/cyber-tech-pouch-pro.png", "Global Nomad, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("NuPhy Slim Mechanical Board", "Global Nomad", "NOVA", 145.00, 
            "Ultra-thin profile with low-latency wireless. Mechanical typing on the go.", 
            "products/nuphy-slim-mechanical-board.png", "Global Nomad, Performance Monster, Creative Beast", techHub));

        // EXTRA 20 PRODUCTS
        // Shadow Coder Expansion -> TECHHUB (Marcus)
        products.add(createProduct("Quantum SSD Hub", "Shadow Coder", "VANGUARD", 245.00, 
            "Minimalist matte black external SSD hub. Top-tier speed with integrated cable concealment.", 
            "products/quantum-ssd-hub.png", "Shadow Coder, Stealth, Performance Monster", techHub));
        
        products.add(createProduct("Onyx Studio Monitors", "Shadow Coder", "VANGUARD", 395.00, 
            "Pair of matte black audiophile speakers. Crystal clear mids for high-focus coding sessions.", 
            "products/onyx-studio-monitors.png", "Shadow Coder, Stealth, Aesthetic Peak", techHub));
        
        products.add(createProduct("Titan Mechanical Wrist Rest", "Shadow Coder", "VANGUARD", 45.00, 
            "Ergonomic anthracite wrist rest with cooling gel. Minimalist design for maximum comfort.", 
            "products/titan-mechanical-wrist-rest.png", "Shadow Coder, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("Stealth Cable Management Kit", "Shadow Coder", "VANGUARD", 35.00, 
            "Luxury magnetic cable organizers in black leather. Keep your stealth workspace zero-clutter.", 
            "products/stealth-cable-management-kit.png", "Shadow Coder, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("Neural Noise-Canceling Headphones", "Shadow Coder", "VANGUARD", 345.00, 
            "High-end ANC headphones with carbon fiber and leather details. Total immersion in code.", 
            "products/neural-noise-canceling-headphones.png", "Shadow Coder, Stealth, Performance Monster", techHub));

        // Organic Creator Expansion -> GADGETPRO (Elena)
        products.add(createProduct("Cedar Laptop Stand", "Organic Creator", "LOOM & LEAF", 165.00, 
            "Bentwood walnut laptop stand. Elevates your screen to the perfect ergonomic height with warmth.", 
            "products/cedar-laptop-stand.png", "Organic Creator, Aesthetic Peak, Setup Essential", gadgetPro));
        
        products.add(createProduct("Foundry Brass Volume Knob", "Organic Creator", "LOOM & LEAF", 95.00, 
            "Solid brushed brass USB volume controller. Analog feel for the modern digital creator.", 
            "products/foundy-brass-volume-knob.png", "Organic Creator, Aesthetic Peak, Creative Beast", gadgetPro));
        
        products.add(createProduct("Terra Wireless Charger", "Organic Creator", "LOOM & LEAF", 115.00, 
            "Ceramic-textured wireless charging pad. High-speed delivery with earthy anthracite tones.", 
            "products/terra-wireless-charger.png", "Organic Creator, Aesthetic Peak, Setup Essential", gadgetPro));
        
        products.add(createProduct("Linen Monitor Dust Cover", "Organic Creator", "LOOM & LEAF", 55.00, 
            "Light-grey linen cover with tan leather accents. Protecting your vision in style.", 
            "products/linen-monitor-dust cover.png", "Organic Creator, Aesthetic Peak, Hidden Gem", gadgetPro));
        
        products.add(createProduct("Botanical Desk Lamp", "Organic Creator", "LOOM & LEAF", 185.00, 
            "Terrarium-integrated desk lamp with soft LED ring. Bring life to your creative desk setup.", 
            "products/botanical-desk-lamp.png", "Organic Creator, Aesthetic Peak, Setup Essential", gadgetPro));

        // The Discovery Expansion -> GADGETPRO (Elena)
        products.add(createProduct("Retro Nixie Tube Clock", "Discovery", "AURA", 285.00, 
            "Warm orange Nixie tube display on a dark walnut base. The ultimate conversation starter.", 
            "products/retro-nixie-tube-clock.png", "Discovery, Conversation Starter, Weird but Useful", gadgetPro));
        
        products.add(createProduct("Binary LED Wall Clock", "Discovery", "AURA", 145.00, 
            "Circular LED clock visualizing time in binary patterns. Science-fiction interior piece.", 
            "products/binary-led-wall-clock.png", "Discovery, Conversation Starter, Weird but Useful", gadgetPro));
        
        products.add(createProduct("Prism Glass Light Cube", "Discovery", "AURA", 85.00, 
            "Optical glass prism that refracts light into rainbows. Kinetic art for your desk.", 
            "products/prism-glass-light cube.png", "Discovery, Conversation Starter, Hidden Gem", gadgetPro));
        
        products.add(createProduct("Plasma Arc Desk Lighter", "Discovery", "AURA", 75.00, 
            "Futuristic plasma lighter with a transparent body. Science meets everyday utility.", 
            "products/plasma-arc-desk-lighter.png", "Discovery, Conversation Starter, Weird but Useful", gadgetPro));
        
        products.add(createProduct("Transparent Pro Controller", "Discovery", "AURA", 125.00, 
            "Clear-shell gaming controller showing high-end internals. Aesthetic meets haptic feedback.", 
            "products/transparent-pro-controller.png", "Discovery, Aesthetic Peak, Setup Essential", gadgetPro));

        // Global Nomad Expansion -> TECHHUB (Marcus)
        products.add(createProduct("Solar Fold Power Bank", "Global Nomad", "NOVA", 135.00, 
            "Rugged fabric-covered foldable solar charger. Infinite power for the off-grid professional.", 
            "products/solar-fold-power-bank.png", "Global Nomad, Performance Monster, Creative Beast", techHub));
        
        products.add(createProduct("Carbon Fiber Tablet Sleeve", "Global Nomad", "NOVA", 95.00, 
            "Ultra-thin carbon fiber protection. Stealth carry for your most portable device.", 
            "products/carbon-fiber-tablet-sleeve.png", "Global Nomad, Stealth, Hidden Gem", techHub));
        
        products.add(createProduct("Anti-Theft Nomad Backpack", "Global Nomad", "NOVA", 175.00, 
            "Minimalist waterproof backpack with steel-reinforced straps. Secure your tech anywhere.", 
            "products/anti-theft-nomad-backpack.png", "Global Nomad, Stealth, Setup Essential", techHub));
        
        products.add(createProduct("Titanium EDC Multi-tool", "Global Nomad", "NOVA", 115.00, 
            "Brushed titanium precision tool. Minimalist carry for the modern explorer.", 
            "products/titanium-edc-edc-multi-tool.png", "Global Nomad, Stealth, Weird but Useful", techHub));
        
        products.add(createProduct("Smart Bone-Conduction Shades", "Global Nomad", "NOVA", 245.00, 
            "Minimalist audio sunglasses. High-fidelity bone conduction without covering your ears.", 
            "products/smart-bone-conduction-shades.png", "Global Nomad, Performance Monster, Setup Essential", techHub));

        // CYBERPUNK PERSONA -> TECHHUB (Marcus)
        products.add(createProduct("Neon Matrix Keycaps", "Cyberpunk", "VANGUARD", 65.00, 
            "Semi-transparent fluorescent keycaps with leaking neon green and purple light. Cyberpunk peak.", 
            "products/neon-matrix-keycaps.png", "Cyberpunk, Synthetic, Performance Monster", techHub));
        
        products.add(createProduct("Graphene Neural Hub", "Cyberpunk", "VANGUARD", 145.00, 
            "Transparent glass-enclosed hub showing glowing blue fiber-optic internal circuits.", 
            "products/graphene-neural-hub.png", "Cyberpunk, Synthetic, Setup Essential", techHub));
        
        products.add(createProduct("Vector RGB Light Bar", "Cyberpunk", "VANGUARD", 95.00, 
            "Geometric sharp-edged light bars casting vibrant pink and cyan shadows. Minimalist synth vibe.", 
            "products/vector-rgb-light-bar.png", "Cyberpunk, Synthetic, Aesthetic Peak", techHub));
        
        products.add(createProduct("Neural Visor Display Art", "Cyberpunk", "AURA", 285.00, 
            "Sleek glass and chrome futuristic visor art. A holographic masterpiece for your desk.", 
            "products/neural-visor-display-art.png", "Cyberpunk, Conversation Starter, Hidden Gem", techHub));
        
        products.add(createProduct("OLED Data-Stream Panel", "Cyberpunk", "VANGUARD", 175.00, 
            "Ultra-thin bezel-less OLED panel showing a continuous green falling data-stream.", 
            "products/oled-data-stream-panel.png", "Cyberpunk, Performance Monster, Weird but Useful", techHub));

        // INDUSTRIAL MINIMALIST -> TECHHUB (Marcus)
        products.add(createProduct("Concrete Wireless Base", "Industrial", "VANGUARD", 85.00, 
            "Rough cast concrete wireless charging block. Brutalist design meeting modern tech.", 
            "products/concrete-wireless-base.png", "Industrial, Aesthetic Peak, Setup Essential", techHub));
        
        products.add(createProduct("Machined Steel Pen Stand", "Industrial", "VANGUARD", 115.00, 
            "Solid machined steel pen holder with industrial bolt details. Weighted for precision.", 
            "products/machined-steeel-pen-stand.png", "Industrial, Aesthetic Peak, Setup Essential", techHub));
        
        products.add(createProduct("Vise Industrial Tablet Mount", "Industrial", "VANGUARD", 95.00, 
            "Heavy-duty mechanical clamp holding your tablet with engineering-grade grip.", 
            "products/vise-industrial-tablet-mount.png", "Industrial, Setup Essential, Weird but Useful", techHub));
        
        products.add(createProduct("Linear Steel LED Beam", "Industrial", "VANGUARD", 245.00, 
            "Minimalist light bar integrated into a raw steel beam. Architectural focus lighting.", 
            "products/lienar-steel-led-beam.png", "Industrial, Aesthetic Peak, Night Work Approved", techHub));
        
        products.add(createProduct("Brutal Desk Clock", "Industrial", "VANGUARD", 125.00, 
            "Solid black granite block with an integrated digital time display. Brutalist perfection.", 
            "products/brutal-desk-clock.png", "Industrial, Aesthetic Peak, Setup Essential", techHub));

        // ZEN MASTER -> GADGETPRO (Elena)
        products.add(createProduct("Levitating Cloud Speaker", "Zen Master", "LOOM & LEAF", 295.00, 
            "Pure white cloud-shaped speaker magnetically levitating over a white oak base.", 
            "products/levitating-cloud-speaker.png", "Zen Master, Aesthetic Peak, Conversation Starter", gadgetPro));
        
        products.add(createProduct("Pure White Monolith Board", "Zen Master", "LOOM & LEAF", 325.00, 
            "Legendless all-white mechanical keyboard. Serene, weightless typing experience.", 
            "products/pure-white-monolith-keyboard.png", "Zen Master, Aesthetic Peak, Stealth", gadgetPro));
        
        products.add(createProduct("Mist-Cloud Humidifier", "Zen Master", "LOOM & LEAF", 75.00, 
            "Minimalist ceramic humidifier emitting a soft ring of mist. Pure serenity.", 
            "products/mist-cloud-humidifier.png", "Zen Master, Aesthetic Peak, Setup Essential", gadgetPro));
        
        products.add(createProduct("Serene Stone Mouse", "Zen Master", "LOOM & LEAF", 115.00, 
            "Pebble-like mouse with a matte white stone texture. Nature meets digital.", 
            "products/serene-stone-mouse.png", "Zen Master, Aesthetic Peak, Stealth", gadgetPro));
        
        products.add(createProduct("White Marble Orbit", "Zen Master", "LOOM & LEAF", 425.00, 
            "Solid white marble sphere magnetically suspended in air. A kinetic art piece.", 
            "products/white-marble-orbit.png", "Zen Master, Aesthetic Peak, Hidden Gem", gadgetPro));

        // RETRO FUTURIST -> GADGETPRO (Elena)
        products.add(createProduct("Analog VU Meter Hub", "Retro Futurist", "AURA", 185.00, 
            "USB hub with dual analog VU meters and walnut finish. Moving needles for warm tech.", 
            "products/analog-vu-meter-hub.png", "Retro Futurist, Aesthetic Peak, Creative Beast", gadgetPro));
        
        products.add(createProduct("Space-Age Orb Monitor", "Retro Futurist", "AURA", 1250.00, 
            "1970s inspired spherical 4K monitor in orange glossy finish. Space-age aesthetic.", 
            "products/space-age-orb-monitor.png", "Retro Futurist, Aesthetic Peak, Performance Monster", gadgetPro));
        
        products.add(createProduct("Tape-Loop Audio Deck", "Retro Futurist", "AURA", 895.00, 
            "Modern tape-loop audio handling with rotating reels and digital OLED control.", 
            "products/tape-loop-audio-deck.png", "Retro Futurist, Creative Beast, Weird but Useful", gadgetPro));
        
        products.add(createProduct("Chrome Aerodynamic Fan", "Retro Futurist", "AURA", 115.00, 
            "Polished chrome aircraft-engine style desk fan. 1950s futurism for your desk.", 
            "products/chrome-aerodynamic-fan.png", "Retro Futurist, Setup Essential, Aesthetic Peak", gadgetPro));
        
        products.add(createProduct("Synthetic Leather Runner", "Retro Futurist", "AURA", 85.00, 
            "Stitched synthetic brown leather mat with retro orange accents. Vintage texture.", 
            "products/synthetic-leather-runner.png", "Retro Futurist, Aesthetic Peak, Setup Essential", gadgetPro));

        for (Product p : products) {
            p.setStockQuantity(50);
        }

        List<Product> saved = productRepository.saveAll(products);
        
        for (Product p : saved) {
            RegionalInventory inv = new RegionalInventory();
            inv.setProduct(p);
            inv.setRegion("Global");
            inv.setStockQuantity(50);
            inventoryRepository.save(inv);
        }
    }

    @SuppressWarnings("all")
    private void seedUsersAndStores() {
        System.out.println("SEED: Performing clean sweep (Orders, Reviews, Profiles, Products, Stores, Users)...");
        orderRepository.deleteAll();
        reviewRepository.deleteAll();
        profileRepository.deleteAll();
        productRepository.deleteAll();
        inventoryRepository.deleteAll();
        storeRepository.deleteAll();
        userRepository.deleteAll();

        // Admin
        updateOrSaveUser("Nexus Admin", "admin@nexus.io", "admin123", Role.ADMIN);
        
        // Managers
        updateOrSaveUser("Marcus Chen", "marcus@techhub.pro", "manager123", Role.MANAGER);
        updateOrSaveUser("Elena Rodriguez", "elena@gadgetpro.co", "manager123", Role.MANAGER);
        
        // Customer
        User daniel = updateOrSaveUser("Daniel Smith", "daniel@nexus.io", "user123", Role.CONSUMER);
        createProfile(daniel, "Shadow Coder", "Dark, matte setups with high-performance mechanics.");

        User sophia = updateOrSaveUser("Sophia Chen", "sophia@nexus.io", "user123", Role.CONSUMER);
        createProfile(sophia, "Organic Creator", "Natural textures, warm lighting, and acoustic perfection.");

        User liam = updateOrSaveUser("Liam Wright", "liam@nexus.io", "user123", Role.CONSUMER);
        createProfile(liam, "Global Nomad", "High-efficiency gadgets that fit in a single tech pouch.");

        User maya = updateOrSaveUser("Maya Rossi", "maya@nexus.io", "user123", Role.CONSUMER);
        createProfile(maya, "The Discovery", "Unique, experimental gadgets that defy common physics.");

        User test = updateOrSaveUser("Test User", "daniel@test.com", "password", Role.CONSUMER);
        createProfile(test, "All-Rounder", "A bit of everything for the ultimate workspace.");

        // Stores
        storeRepository.save(Store.builder().name("Nexus Central").ownerName("Nexus Admin").totalRevenue(500000.0).orderCount(12000).rating(5.0).status("OPEN").build());
        storeRepository.save(Store.builder().name("TechHub Performance").ownerName("Marcus Chen").totalRevenue(285000.0).orderCount(4500).rating(4.8).status("OPEN").build());
        storeRepository.save(Store.builder().name("GadgetPro Lifestyle").ownerName("Elena Rodriguez").totalRevenue(195000.0).orderCount(2800).rating(4.9).status("OPEN").build());
    }

    private User updateOrSaveUser(String name, String email, String pass, Role role) {
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
        
        return userRepository.save(user);
    }

    @SuppressWarnings("all")
    private void createProfile(User user, String persona, String bio) {
        CustomerProfile profile = CustomerProfile.builder()
            .user(user)
            .personaType(persona)
            .bio(bio)
            .totalSpend(java.math.BigDecimal.ZERO)
            .itemsPurchased(0)
            .preferredStyle("Minimalist")
            .satisfactionLevel("Satisfied")
            .membershipType("Bronze")
            .build();
        profileRepository.save(profile);
    }

    private Product createProduct(String name, String cat, String brand, double price, String desc, String img, String tags, Store store) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setBasePrice(java.math.BigDecimal.valueOf(price));
        p.setDescription(desc);
        p.setImageUrl(img);
        p.setTags(tags);
        p.setStore(store);
        return p;
    }
}
