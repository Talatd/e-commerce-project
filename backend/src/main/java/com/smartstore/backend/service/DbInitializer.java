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
    private final CouponRepository couponRepository;
    private final ProductReviewRepository reviewRepository;
    private final AuditLogRepository auditLogRepository;
    private final CustomerProfileRepository profileRepository;
    private final OrderEventRepository orderEventRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final ShipmentRepository shipmentRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @jakarta.annotation.PostConstruct
    @jakarta.transaction.Transactional
    public void init() {
        if (userRepository.count() == 0 || storeRepository.count() == 0) {
            seedUsersAndStores();
            seedCategories();
            seedCuratedProducts();
            seedSpecifications();
            seedShippingInfo();
        }

        if (couponRepository.count() == 0) {
            seedCoupons();
        }

        if (orderRepository.count() == 0) {
            seedHistoricalData();
        }
        System.out.println("SEED: Initialization complete.");
    }

    private void seedCoupons() {
        Coupon c1 = new Coupon();
        c1.setCode("NEXUS20");
        c1.setPercentOff(20);
        c1.setActive(true);
        c1.setExpiresAt(java.time.LocalDateTime.now().plusYears(3));
        couponRepository.save(c1);

        Coupon c2 = new Coupon();
        c2.setCode("TECH30");
        c2.setPercentOff(30);
        c2.setRestrictedCategory("Technology");
        c2.setActive(true);
        c2.setExpiresAt(java.time.LocalDateTime.now().plusYears(1));
        couponRepository.save(c2);

        Coupon c3 = new Coupon();
        c3.setCode("ZEN15");
        c3.setPercentOff(15);
        c3.setRestrictedCategory("Lifestyle");
        c3.setActive(true);
        c3.setExpiresAt(java.time.LocalDateTime.now().plusYears(1));
        couponRepository.save(c3);
    }

    @SuppressWarnings("all")
    private void seedHistoricalData() {
        System.out.println("SEED: Generating historical analytics data...");
        shipmentRepository.deleteAll();
        orderEventRepository.deleteAll();
        orderRepository.deleteAll();
        reviewRepository.deleteAll();
        seedAuditLogs();
        seedCustomerReviews();
        seedHistoricalOrders();
        updateCustomerSpendMetrics();
    }

    @SuppressWarnings("all")
    private void seedAuditLogs() {
        auditLogRepository.save(AuditLog.builder().username("system").action("MARKETPLACE_INITIALIZED").type("SYSTEM")
                .detail("Marketplace core services started").build());
        auditLogRepository.save(AuditLog.builder().username("marcus@techhub.pro").action("STORE_OPENED").type("STORE")
                .detail("TechHub Performance store is now live").build());
        auditLogRepository.save(AuditLog.builder().username("elena@gadgetpro.co").action("STORE_OPENED").type("STORE")
                .detail("GadgetPro Lifestyle store is now live").build());
        auditLogRepository.save(AuditLog.builder().username("marcus@techhub.pro").action("PRODUCT_ADDED")
                .type("INVENTORY").detail("VANGUARD Stealth-Key added to catalog").build());
    }

    public void reseedReviews() {
        reviewRepository.deleteAll();
        seedCustomerReviews();
    }

    private void seedCustomerReviews() {
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findByRole(Role.CONSUMER);
        if (products.isEmpty() || users.isEmpty())
            return;

        Random random = new Random();

        String[] excellentComments = {
                "This setup literally changed my workflow. The build quality is unmatched.",
                "Absolutely stunning aesthetic. It perfectly fits my vibe.",
                "Minimalist perfection. Fast shipping and the packaging was premium too.",
                "The best purchase I've made this year. Flawless.",
                "Works out of the box exactly as described. Huge fan of the materials used.",
                "Incredible attention to detail. My productivity has skyrocketed."
        };

        String[] goodComments = {
                "Great connectivity. Solid build, feels very premium in hand.",
                "The finish is so warm. My desk feels alive now.",
                "I'm obsessed with this. Everyone who visits asks about it!",
                "Good value for the price. Would recommend to friends.",
                "Very satisfied overall. A few minor quirks but nothing deal-breaking."
        };

        String[] mixedComments = {
                "It's decent, but a bit overpriced for what it is.",
                "Looks great but the functionality is just average.",
                "I like the design, but setup was more complicated than it should be.",
                "Middle of the road product. Not bad, not amazing.",
                "It gets the job done, but I wish the materials were a bit more durable."
        };

        String[] badComments = {
                "Broke after two weeks of use. Completely unacceptable.",
                "The item doesn't look like the pictures. Very disappointed.",
                "Customer support was unhelpful when I reported a defect.",
                "Do not buy this. Huge waste of money and time.",
                "Extremely poor quality control. Arrived scratched and dented."
        };

        String[] aggressiveComments = {
                "This is absolute garbage! The company should be ashamed for selling this junk.",
                "Worst product ever! I want my money back immediately. Total scam!",
                "Who designed this trash? An absolute joke of a product.",
                "Don't ever buy from this brand. They are ripping people off with this cheap plastic crap!"
        };

        String[] helpfulCriticalComments = {
                "While the aesthetic is beautiful, the heat dissipation is poorly engineered. If you run heavy workloads, it throttles quickly. 2 stars.",
                "I love the concept, but the firmware is buggy. If they fix the Bluetooth dropout issue in the next update, it would be a 5-star product.",
                "The build is solid aluminum, which is great, but the included cable is too short (only 0.5m). You'll need to buy a separate extension."
        };

        for (Product p : products) {
            int numReviews = 3 + random.nextInt(6); // 3 to 8 reviews
            int totalRating = 0;

            for (int i = 0; i < numReviews; i++) {
                ProductReview review = new ProductReview();
                review.setProduct(p);
                review.setUser(users.get(random.nextInt(users.size())));

                int type = random.nextInt(100);
                int rating;
                if (type < 40) { // 40% Excellent
                    rating = 5;
                    review.setComment(excellentComments[random.nextInt(excellentComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.8 + random.nextDouble() * 0.2));
                } else if (type < 70) { // 30% Good
                    rating = 4;
                    review.setComment(goodComments[random.nextInt(goodComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.6 + random.nextDouble() * 0.2));
                } else if (type < 80) { // 10% Mixed
                    rating = 3;
                    review.setComment(mixedComments[random.nextInt(mixedComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.4 + random.nextDouble() * 0.2));
                } else if (type < 85) { // 5% Helpful Critical
                    rating = 2 + random.nextInt(2);
                    review.setComment(helpfulCriticalComments[random.nextInt(helpfulCriticalComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.3 + random.nextDouble() * 0.2));
                } else if (type < 95) { // 10% Bad
                    rating = 1 + random.nextInt(2);
                    review.setComment(badComments[random.nextInt(badComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.1 + random.nextDouble() * 0.2));
                } else { // 5% Aggressive
                    rating = 1;
                    review.setComment(aggressiveComments[random.nextInt(aggressiveComments.length)]);
                    review.setSentimentScore(java.math.BigDecimal.valueOf(0.0 + random.nextDouble() * 0.1));
                }

                review.setRating(rating);
                totalRating += rating;
                review.setCreatedAt(java.time.LocalDateTime.now().minusDays(random.nextInt(180)));

                // CROSS-CHECK Sentiment Score with Star Rating
                double baseSentiment = (rating - 1) / 4.0; // 1->0.0, 5->1.0
                double noise = (random.nextDouble() - 0.5) * 0.1; // +/- 0.05
                review.setSentimentScore(java.math.BigDecimal.valueOf(Math.min(1.0, Math.max(0.0, baseSentiment + noise))));

                // Add Store Responses based on rating
                if (rating >= 4 && random.nextBoolean()) {
                    review.setStoreResponse("Thank you for your wonderful feedback! We're thrilled you're enjoying the " + p.getName() + ". Our team strives for this level of quality.");
                    review.setRespondedAt(review.getCreatedAt().plusDays(1 + random.nextInt(2)));
                } else if (rating <= 2) {
                    review.setStoreResponse("We are truly sorry that the " + p.getName() + " didn't meet your expectations. Please reach out to our support team so we can make this right.");
                    review.setRespondedAt(review.getCreatedAt().plusHours(4 + random.nextInt(24)));
                }

                reviewRepository.save(review);
            }

            // Update product with average rating and count
            p.setRating(Math.round((double) totalRating / numReviews * 10.0) / 10.0);
            p.setReviewCount(numReviews);
            productRepository.save(p);
        }
    }

    private void seedHistoricalOrders() {
        List<Product> products = productRepository.findAll();
        List<User> users = userRepository.findByRole(Role.CONSUMER);
        if (products.isEmpty() || users.isEmpty())
            return;

        Random random = new Random();

        for (int i = 0; i < 60; i++) {
            Order order = new Order();
            order.setUser(users.get(random.nextInt(users.size())));
            order.setShippingAddress("123 Tech Lane, San Francisco, CA");
            order.setOrderDate(java.time.LocalDateTime.now().minusDays(random.nextInt(180)));

            // Randomly set status based on age
            if (i < 40)
                order.setStatus(OrderStatus.DELIVERED);
            else if (i < 45)
                order.setStatus(OrderStatus.RETURNED); // 5 orders returned
            else if (i < 50)
                order.setStatus(OrderStatus.CANCELLED);
            else if (i < 55)
                order.setStatus(OrderStatus.SHIPPED);
            else
                order.setStatus(OrderStatus.PROCESSING);

            // Apply coupons to some orders
            if (i % 4 == 0) {
                order.setCouponCode("NEXUS20");
                order.setDiscountAmount(java.math.BigDecimal.valueOf(10.0)); // simplified
            } else if (i % 7 == 0) {
                order.setCouponCode("TECH30");
            }

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
            Order savedOrder = orderRepository.save(order);

            // Seed Order Events and Shipment for the saved order
            seedEventsForOrder(savedOrder, random);
            seedShipmentForOrder(savedOrder, random);
        }
    }

    private void updateCustomerSpendMetrics() {
        // Recompute customer profile spend after seeding orders so dashboards show
        // meaningful values.
        System.out.println("SEED: Updating customer spend metrics...");

        List<CustomerProfile> profiles = profileRepository.findAll();
        if (profiles.isEmpty())
            return;

        // Aggregate orders per user
        Map<Long, java.math.BigDecimal> spendByUser = new HashMap<>();
        Map<Long, Integer> itemsByUser = new HashMap<>();

        for (Order o : orderRepository.findAllWithItems()) {
            if (o.getUser() == null || o.getUser().getUserId() == null)
                continue;
            Long uid = o.getUser().getUserId();
            java.math.BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : java.math.BigDecimal.ZERO;
            spendByUser.put(uid, spendByUser.getOrDefault(uid, java.math.BigDecimal.ZERO).add(amt));

            int itemCount = 0;
            if (o.getItems() != null) {
                for (OrderItem it : o.getItems()) {
                    itemCount += it.getQuantity() != null ? it.getQuantity() : 0;
                }
            }
            itemsByUser.put(uid, itemsByUser.getOrDefault(uid, 0) + itemCount);
        }

        // Apply aggregates to profiles
        for (CustomerProfile p : profiles) {
            if (p.getUser() == null || p.getUser().getUserId() == null)
                continue;
            Long uid = p.getUser().getUserId();
            p.setTotalSpend(spendByUser.getOrDefault(uid, java.math.BigDecimal.ZERO));
            p.setItemsPurchased(itemsByUser.getOrDefault(uid, 0));
        }
        profileRepository.saveAll(profiles);
    }

    @SuppressWarnings("all")
    private void seedEventsForOrder(Order order, Random random) {
        // Every order has a CREATED event
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .status("PENDING")
                .eventDate(order.getOrderDate())
                .notes("Order received by system.")
                .build());

        if (order.getStatus() == OrderStatus.PENDING)
            return;

        // PROCESSING event: 2-6 hours after creation
        java.time.LocalDateTime processingDate = order.getOrderDate().plusHours(2 + random.nextInt(4));
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .status("PROCESSING")
                .eventDate(processingDate)
                .notes("Order is being prepared by the store.")
                .build());

        if (order.getStatus() == OrderStatus.PROCESSING)
            return;

        // SHIPPED event: 12-24 hours after processing
        java.time.LocalDateTime shippingDate = processingDate.plusHours(12 + random.nextInt(12));
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .status("SHIPPED")
                .eventDate(shippingDate)
                .notes("Order has been handed over to the delivery partner.")
                .build());

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.CANCELLED)
            return;

        // DELIVERED event: 1-3 days after shipping
        java.time.LocalDateTime deliveryDate = shippingDate.plusDays(1 + random.nextInt(3));
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .status("DELIVERED")
                .eventDate(deliveryDate)
                .notes("Order successfully delivered to the customer.")
                .build());

        if (order.getStatus() != OrderStatus.RETURNED)
            return;

        // RETURNED event: 5-10 days after delivery
        orderEventRepository.save(OrderEvent.builder()
                .order(order)
                .status("RETURNED")
                .eventDate(deliveryDate.plusDays(5 + random.nextInt(5)))
                .notes("Customer requested a return. Item received and inspected.")
                .build());
    }

    private void seedShipmentForOrder(Order order, Random random) {
        if (order.getStatus() == OrderStatus.PENDING) return;

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setWarehouseBlock(new String[]{"A-14", "B-02", "C-09", "D-22", "E-05"}[random.nextInt(5)]);
        shipment.setModeOfShipment(new String[]{"Road", "Flight", "Ship"}[random.nextInt(3)]);
        shipment.setCarrier(new String[]{"Nexus Logistics", "Global Express", "Prime Delivery", "Swift Carrier"}[random.nextInt(4)]);
        shipment.setTrackingNumber("NX-" + (100000 + random.nextInt(900000)));
        
        // Estimated delivery: 3-5 days after order date
        shipment.setEstimatedDelivery(order.getOrderDate().plusDays(3 + random.nextInt(3)));
        
        if (order.getStatus() == OrderStatus.PROCESSING) {
            shipment.setStatus(Shipment.ShipmentStatus.PREPARING);
        } else if (order.getStatus() == OrderStatus.SHIPPED) {
            shipment.setStatus(Shipment.ShipmentStatus.SHIPPED);
            shipment.setShippedAt(order.getOrderDate().plusHours(24));
        } else if (order.getStatus() == OrderStatus.DELIVERED) {
            shipment.setStatus(Shipment.ShipmentStatus.DELIVERED);
            shipment.setShippedAt(order.getOrderDate().plusHours(24));
            shipment.setDeliveredAt(shipment.getEstimatedDelivery().minusHours(random.nextInt(12)));
            shipment.setOnTimeDelivery(true);
        } else if (order.getStatus() == OrderStatus.RETURNED) {
            shipment.setStatus(Shipment.ShipmentStatus.RETURNED);
            shipment.setShippedAt(order.getOrderDate().plusHours(24));
            shipment.setDeliveredAt(order.getOrderDate().plusDays(4));
        }
        
        shipmentRepository.save(shipment);
    }

    private void seedCuratedProducts() {
        List<Product> products = new ArrayList<>();

        Store techHub = storeRepository.findByName("TechHub Performance").orElseThrow();
        Store gadgetPro = storeRepository.findByName("GadgetPro Lifestyle").orElseThrow();

        // Persona: The Shadow Coder (Performance & Stealth) -> TECHHUB (Marcus)
        products.add(createProduct("Stealth-Key TKL Mechanical Keyboard", "Keyboards", "VANGUARD", 189.00,
                "Matte finish, silent tactile switches, and carbon fiber reinforcement. Designed for total immersion.",
                "products/shadow-coder-keyboard.png",
                "Shadow Coder, Stealth, Minimalist, Silent, Ergonomic, Mechanical, Tactical", techHub));

        products.add(createProduct("Precision Flow MX Mouse", "Mice", "VANGUARD", 119.00,
                "Ultra-low latency with graphite matte texture. Ergonomics meet extreme performance.",
                "products/precision-flow-mouse.png",
                "Shadow Coder, Stealth, Ergonomic, High-Precision, Wireless, Productivity", techHub));

        products.add(createProduct("FocusBar Monitor Light", "Accessories", "VANGUARD", 159.00,
                "Asymmetric optical design to eliminate screen glare. Essential for night coding sessions.",
                "products/focusbar-light.png", "Shadow Coder, Night Work, Minimalist, Eye-Care, USB-Powered", techHub));

        products.add(createProduct("Apex Carbon Desk Mat", "Accessories", "VANGUARD", 75.00,
                "Large-scale desk pad with woven carbon fibers for maximum mouse glide precision.",
                "products/apex-desk-mat.png", "Shadow Coder, Stealth, Premium-Material, Carbon-Fiber, Durable",
                techHub));

        products.add(createProduct("Onyx Dual Monitor Arm", "Accessories", "VANGUARD", 245.00,
                "Heavy-duty matte black dual arm with integrated cable management. Clean desk peak.",
                "products/onyx-monitor-arm.png",
                "Shadow Coder, Stealth, Space-Saving, Heavy-Duty, Minimalist, Ergonomic", techHub));

        // Persona: The Organic Creator (Aesthetic & Natural) -> GADGETPRO (Elena)
        products.add(createProduct("Orbit Walnut Vinyl Player", "Audio", "LOOM & LEAF", 495.00,
                "Minimalist walnut plinth with professional-grade tonearm. Analog soul for digital creators.",
                "products/walnut-vinyl-player.png",
                "Organic Creator, Aesthetic, Audiophile, Natural-Wood, Premium-Build", gadgetPro));

        products.add(createProduct("Foundry Brass Studio Microphone", "Audio", "LOOM & LEAF", 425.00,
                "Vintage-inspired brass finish with modern XLR condenser technology. Rich, warm vocals.",
                "products/foundry-brass-mic.png",
                "Organic Creator, Studio-Grade, Professional, Aesthetic, Brass-Finish", gadgetPro));

        products.add(createProduct("Heritage Headphone Stand", "Accessories", "LOOM & LEAF", 115.00,
                "Solid oak wood with a brushed brass base. The perfect resting place for premium audio gear.",
                "products/heritage-headphone-stand.png",
                "Organic Creator, Minimalist, Solid-Wood, Aesthetic, Desk-Organized",
                gadgetPro));

        products.add(createProduct("Loom Felt Desk Pad", "Accessories", "LOOM & LEAF", 65.00,
                "Soft light-grey wool felt with genuine leather accents. Comfort for the creative tactile soul.",
                "products/loom-felt-desk-pad.png",
                "Organic Creator, Tactile, Soft-Touch, Natural-Materials, Minimalist", gadgetPro));

        // Persona: The Discovery (Oddities & Kinetic Art) -> GADGETPRO (Elena)
        products.add(createProduct("Gravity Floating Kinetic Pen", "Lifestyle", "AURA", 95.00,
                "A magnetically suspended pen that rotates at a 23.5 degree angle. A masterpiece of physics.",
                "products/gravity-kinetic-pen.png", "Discovery, Conversation-Starter, Magnetic, Kinetic-Art, Unique",
                gadgetPro));

        products.add(createProduct("Heng Balance Magnetic Lamp", "Lifestyle", "AURA", 125.00,
                "Unique lamp where two magnetic wooden balls act as the power switch. Award-winning design.",
                "products/heng-balance-magnetic-lamp.png", "Discovery, Aesthetic, Award-Winning, Magnetic, Minimalist",
                gadgetPro));

        products.add(createProduct("Ferrofluid Music Visualizer", "Lifestyle", "AURA", 195.00,
                "A glass ferrofluid speaker with black liquid reacting to the rhythm of sound.",
                "products/ferrofluid-music-visualizer.png", "Discovery, Science-Art, Visualizer, Unique, High-Tech",
                gadgetPro));

        // Persona: The Global Nomad (Travel & Mobility) -> TECHHUB (Marcus)
        products.add(createProduct("Nova GaN Travel Adapter", "Mobility", "NOVA", 89.00,
                "Ultra-slim 100W multi-country adapter with 3x USB-C ports. The only power block you need.",
                "products/vanguard-gan-world-adapter.png",
                "Global Nomad, Travel-Essential, Compact, High-Power, GaN-Tech", techHub));

        products.add(createProduct("Cyber Tech Pouch Pro", "Mobility", "NOVA", 65.00,
                "Waterproof origami-style organizer for cables, drives, and tools. Rugged luxury travel kit.",
                "products/cyber-tech-pouch-pro.png", "Global Nomad, Waterproof, Organized, Durable, Lightweight",
                techHub));

        products.add(createProduct("NuPhy Slim Mechanical Board", "Keyboards", "NOVA", 145.00,
                "Ultra-thin profile with low-latency wireless. Mechanical typing on the go.",
                "products/nuphy-slim-mechanical-board.png", "Global Nomad, Portable, Mechanical, Wireless, Ultra-Slim",
                techHub));

        // EXTRA 20 PRODUCTS
        // Shadow Coder Expansion -> TECHHUB (Marcus)
        products.add(createProduct("Quantum SSD Hub", "Storage", "VANGUARD", 245.00,
                "Minimalist matte black external SSD hub. Top-tier speed with integrated cable concealment.",
                "products/quantum-ssd-hub.png", "Shadow Coder, Stealth, High-Speed, Minimalist, Aluminum-Shell",
                techHub));

        products.add(createProduct("Onyx Studio Monitors", "Audio", "VANGUARD", 395.00,
                "Pair of matte black audiophile speakers. Crystal clear mids for high-focus coding sessions.",
                "products/onyx-studio-monitors.png", "Shadow Coder, Stealth, Audiophile, Studio-Quality, Minimalist",
                techHub));

        products.add(createProduct("Titan Mechanical Wrist Rest", "Accessories", "VANGUARD", 45.00,
                "Ergonomic anthracite wrist rest with cooling gel. Minimalist design for maximum comfort.",
                "products/titan-mechanical-wrist-rest.png", "Shadow Coder, Ergonomic, Comfort, Cooling-Gel, Minimalist",
                techHub));

        products.add(createProduct("Stealth Cable Management Kit", "Accessories", "VANGUARD", 35.00,
                "Luxury magnetic cable organizers in black leather. Keep your stealth workspace zero-clutter.",
                "products/stealth-cable-management-kit.png",
                "Shadow Coder, Organization, Magnetic, Premium-Leather, Stealth", techHub));

        products.add(createProduct("Neural Noise-Canceling Headphones", "Audio", "VANGUARD", 345.00,
                "High-end ANC headphones with carbon fiber and leather details. Total immersion in code.",
                "products/neural-noise-canceling-headphones.png",
                "Shadow Coder, Stealth, ANC, Carbon-Fiber, Professional",
                techHub));

        // Organic Creator Expansion -> GADGETPRO (Elena)
        products.add(createProduct("Cedar Laptop Stand", "Accessories", "LOOM & LEAF", 165.00,
                "Bentwood walnut laptop stand. Elevates your screen to the perfect ergonomic height with warmth.",
                "products/cedar-laptop-stand.png", "Organic Creator, Ergonomic, Sustainable, Walnut-Wood, Aesthetic",
                gadgetPro));

        products.add(createProduct("Foundry Brass Volume Knob", "Accessories", "LOOM & LEAF", 95.00,
                "Solid brushed brass USB volume controller. Analog feel for the modern digital creator.",
                "products/foundy-brass-volume-knob.png",
                "Organic Creator, Analog-Feel, Brass-Finish, Aesthetic, Creative", gadgetPro));

        products.add(createProduct("Terra Wireless Charger", "Accessories", "LOOM & LEAF", 115.00,
                "Ceramic-textured wireless charging pad. High-speed delivery with earthy anthracite tones.",
                "products/terra-wireless-charger.png", "Organic Creator, Aesthetic, Ceramic, Fast-Charging, Minimalist",
                gadgetPro));

        products.add(createProduct("Linen Monitor Dust Cover", "Accessories", "LOOM & LEAF", 55.00,
                "Light-grey linen cover with tan leather accents. Protecting your vision in style.",
                "products/linen-monitor-dust cover.png",
                "Organic Creator, Protection, Natural-Fiber, Aesthetic, Minimalist", gadgetPro));

        products.add(createProduct("Botanical Desk Lamp", "Lifestyle", "LOOM & LEAF", 185.00,
                "Terrarium-integrated desk lamp with soft LED ring. Bring life to your creative desk setup.",
                "products/botanical-desk-lamp.png", "Organic Creator, Biophilic, Unique, Aesthetic, Soft-Light",
                gadgetPro));

        // The Discovery Expansion -> GADGETPRO (Elena)
        products.add(createProduct("Retro Nixie Tube Clock", "Lifestyle", "AURA", 285.00,
                "Warm orange Nixie tube display on a dark walnut base. The ultimate conversation starter.",
                "products/retro-nixie-tube-clock.png", "Discovery, Retro, Vintage, Conversation-Starter, Unique",
                gadgetPro));

        products.add(createProduct("Binary LED Wall Clock", "Lifestyle", "AURA", 145.00,
                "Circular LED clock visualizing time in binary patterns. Science-fiction interior piece.",
                "products/binary-led-wall-clock.png", "Discovery, Sci-Fi, Binary, Minimalist, High-Tech", gadgetPro));

        products.add(createProduct("Prism Glass Light Cube", "Lifestyle", "AURA", 85.00,
                "Optical glass prism that refracts light into rainbows. Kinetic art for your desk.",
                "products/prism-glass-light cube.png", "Discovery, Kinetic-Art, Optical, Aesthetic, Unique",
                gadgetPro));

        products.add(createProduct("Plasma Arc Desk Lighter", "Lifestyle", "AURA", 75.00,
                "Futuristic plasma lighter with a transparent body. Science meets everyday utility.",
                "products/plasma-arc-desk-lighter.png", "Discovery, Futuristic, High-Tech, Transparent, Unique",
                gadgetPro));

        products.add(createProduct("Transparent Pro Controller", "Lifestyle", "AURA", 125.00,
                "Clear-shell gaming controller showing high-end internals. Aesthetic meets haptic feedback.",
                "products/transparent-pro-controller.png", "Discovery, Gaming, Transparent, Aesthetic, Haptic",
                gadgetPro));

        // Global Nomad Expansion -> TECHHUB (Marcus)
        products.add(createProduct("Solar Fold Power Bank", "Mobility", "NOVA", 135.00,
                "Rugged fabric-covered foldable solar charger. Infinite power for the off-grid professional.",
                "products/solar-fold-power-bank.png", "Global Nomad, Off-Grid, Solar, Durable, Travel-Essential",
                techHub));

        products.add(createProduct("Carbon Fiber Tablet Sleeve", "Mobility", "NOVA", 95.00,
                "Ultra-thin carbon fiber protection. Stealth carry for your most portable device.",
                "products/carbon-fiber-tablet-sleeve.png", "Global Nomad, Carbon-Fiber, Lightweight, Durable, Stealth",
                techHub));

        products.add(createProduct("Anti-Theft Nomad Backpack", "Mobility", "NOVA", 175.00,
                "Minimalist waterproof backpack with steel-reinforced straps. Secure your tech anywhere.",
                "products/anti-theft-nomad-backpack.png", "Global Nomad, Security, Waterproof, Minimalist, Travel",
                techHub));

        products.add(createProduct("Titanium EDC Multi-tool", "Mobility", "NOVA", 115.00,
                "Brushed titanium precision tool. Minimalist carry for the modern explorer.",
                "products/titanium-edc-edc-multi-tool.png", "Global Nomad, Titanium, EDC, Minimalist, Durable",
                techHub));

        products.add(createProduct("Smart Bone-Conduction Shades", "Mobility", "NOVA", 245.00,
                "Minimalist audio sunglasses. High-fidelity bone conduction without covering your ears.",
                "products/smart-bone-conduction-shades.png", "Global Nomad, Audio, Bone-Conduction, Futuristic, Travel",
                techHub));

        // CYBERPUNK PERSONA -> TECHHUB (Marcus)
        products.add(createProduct("Neon Matrix Keycaps", "Keyboards", "VANGUARD", 65.00,
                "Semi-transparent fluorescent keycaps with leaking neon green and purple light. Cyberpunk peak.",
                "products/neon-matrix-keycaps.png", "Cyberpunk, Neon, Aesthetic, Mechanical, Custom", techHub));

        products.add(createProduct("Graphene Neural Hub", "Accessories", "VANGUARD", 145.00,
                "Transparent glass-enclosed hub showing glowing blue fiber-optic internal circuits.",
                "products/graphene-neural-hub.png", "Cyberpunk, Futuristic, High-Speed, Aesthetic, Tech-Art", techHub));

        products.add(createProduct("Vector RGB Light Bar", "Accessories", "VANGUARD", 95.00,
                "Geometric sharp-edged light bars casting vibrant pink and cyan shadows. Minimalist synth vibe.",
                "products/vector-rgb-light-bar.png", "Cyberpunk, RGB, Aesthetic, Minimalist, Lighting", techHub));

        products.add(createProduct("Neural Visor Display Art", "Lifestyle", "AURA", 285.00,
                "Sleek glass and chrome futuristic visor art. A holographic masterpiece for your desk.",
                "products/neural-visor-display-art.png", "Cyberpunk, Futuristic, Glass-Art, Unique, Aesthetic",
                techHub));

        products.add(createProduct("OLED Data-Stream Panel", "Accessories", "VANGUARD", 175.00,
                "Ultra-thin bezel-less OLED panel showing a continuous green falling data-stream.",
                "products/oled-data-stream-panel.png", "Cyberpunk, OLED, High-Tech, Unique, Data-Art", techHub));

        // INDUSTRIAL MINIMALIST -> TECHHUB (Marcus)
        products.add(createProduct("Concrete Wireless Base", "Accessories", "VANGUARD", 85.00,
                "Rough cast concrete wireless charging block. Brutalist design meeting modern tech.",
                "products/concrete-wireless-base.png", "Industrial, Brutalist, Concrete, Minimalist, Wireless",
                techHub));

        products.add(createProduct("Machined Steel Pen Stand", "Accessories", "VANGUARD", 115.00,
                "Solid machined steel pen holder with industrial bolt details. Weighted for precision.",
                "products/machined-steeel-pen-stand.png", "Industrial, Machined-Steel, Minimalist, Durable, Desk-Org",
                techHub));

        products.add(createProduct("Vise Industrial Tablet Mount", "Accessories", "VANGUARD", 95.00,
                "Heavy-duty mechanical clamp holding your tablet with engineering-grade grip.",
                "products/vise-industrial-tablet-mount.png", "Industrial, Heavy-Duty, Steel, Functional, Minimalist",
                techHub));

        products.add(createProduct("Linear Steel LED Beam", "Accessories", "VANGUARD", 245.00,
                "Minimalist light bar integrated into a raw steel beam. Architectural focus lighting.",
                "products/lienar-steel-led-beam.png", "Industrial, Architectural, Steel, Minimalist, High-Power",
                techHub));

        products.add(createProduct("Brutal Desk Clock", "Lifestyle", "VANGUARD", 125.00,
                "Solid black granite block with an integrated digital time display. Brutalist perfection.",
                "products/brutal-desk-clock.png", "Industrial, Brutalist, Granite, Minimalist, Unique", techHub));

        // ZEN MASTER -> GADGETPRO (Elena)
        products.add(createProduct("Levitating Cloud Speaker", "Audio", "LOOM & LEAF", 295.00,
                "Pure white cloud-shaped speaker magnetically levitating over a white oak base.",
                "products/levitating-cloud-speaker.png", "Zen, Levitating, White-Oak, Minimalist, Aesthetic",
                gadgetPro));

        products.add(createProduct("Pure White Monolith Board", "Keyboards", "LOOM & LEAF", 325.00,
                "Legendless all-white mechanical keyboard. Serene, weightless typing experience.",
                "products/pure-white-monolith-keyboard.png", "Zen, Minimalist, All-White, Mechanical, Silent",
                gadgetPro));

        products.add(createProduct("Mist-Cloud Humidifier", "Lifestyle", "LOOM & LEAF", 75.00,
                "Minimalist ceramic humidifier emitting a soft ring of mist. Pure serenity.",
                "products/mist-cloud-humidifier.png", "Zen, Ceramic, Minimalist, Serene, Healthy-Living", gadgetPro));

        products.add(createProduct("Serene Stone Mouse", "Zen Master", "LOOM & LEAF", 115.00,
                "Pebble-like mouse with a matte white stone texture. Nature meets digital.",
                "products/serene-stone-mouse.png", "Zen, Natural-Texture, Stone-Finish, Minimalist, Ergonomic",
                gadgetPro));

        products.add(createProduct("White Marble Orbit", "Lifestyle", "LOOM & LEAF", 425.00,
                "Solid white marble sphere magnetically suspended in air. A kinetic art piece.",
                "products/white-marble-orbit.png", "Zen, Marble, Kinetic-Art, Aesthetic, Unique", gadgetPro));

        // RETRO FUTURIST -> GADGETPRO (Elena)
        products.add(createProduct("Analog VU Meter Hub", "Accessories", "AURA", 185.00,
                "USB hub with dual analog VU meters and walnut finish. Moving needles for warm tech.",
                "products/analog-vu-meter-hub.png", "Retro, Analog, VU-Meter, Walnut, Aesthetic", gadgetPro));

        products.add(createProduct("Space-Age Orb Monitor", "Monitors", "AURA", 1250.00,
                "1970s inspired spherical 4K monitor in orange glossy finish. Space-age aesthetic.",
                "products/space-age-orb-monitor.png", "Retro, Space-Age, 4K, Unique, Collector-Item",
                gadgetPro));

        products.add(createProduct("Tape-Loop Audio Deck", "Audio", "AURA", 895.00,
                "Modern tape-loop audio handling with rotating reels and digital OLED control.",
                "products/tape-loop-audio-deck.png", "Retro, Audiophile, Tape-Loop, High-Fidelity, Aesthetic",
                gadgetPro));

        products.add(createProduct("Chrome Aerodynamic Fan", "Lifestyle", "AURA", 115.00,
                "Polished chrome aircraft-engine style desk fan. 1950s futurism for your desk.",
                "products/chrome-aerodynamic-fan.png", "Retro, Industrial, Chrome, Aerodynamic, Unique", gadgetPro));

        products.add(createProduct("Synthetic Leather Runner", "Accessories", "AURA", 85.00,
                "Stitched synthetic brown leather mat with retro orange accents. Vintage texture.",
                "products/synthetic-leather-runner.png", "Retro, Leather, Vintage, Aesthetic, Desk-Protection",
                gadgetPro));

        for (Product p : products) {
            p.setStockQuantity(50);
        }

        List<Product> saved = productRepository.saveAll(products);

        for (Product p : saved) {
            // Global
            inventoryRepository.save(Objects.requireNonNull(
                    RegionalInventory.builder().product(p).region("Global").stockQuantity(50).build()
            ));
            // Europe
            inventoryRepository.save(Objects.requireNonNull(
                    RegionalInventory.builder().product(p).region("Europe").stockQuantity(20 + new Random().nextInt(30)).build()
            ));
            // Asia
            inventoryRepository.save(Objects.requireNonNull(
                    RegionalInventory.builder().product(p).region("Asia").stockQuantity(10 + new Random().nextInt(40)).build()
            ));
        }
    }

    @SuppressWarnings("all")
    private void seedUsersAndStores() {
        System.out.println("SEED: Performing clean sweep (Events, Tokens, Shipments, Orders, Reviews, Profiles, Products, Stores, Users)...");
        orderEventRepository.deleteAll();
        tokenRepository.deleteAll();
        shipmentRepository.deleteAll();
        orderRepository.deleteAll();
        reviewRepository.deleteAll();
        profileRepository.deleteAll();
        productRepository.deleteAll();
        inventoryRepository.deleteAll();
        storeRepository.deleteAll();
        userRepository.deleteAll();
        categoryRepository.deleteAll();

        // Admin
        updateOrSaveUser("Nexus Admin", "admin@nexus.io", "admin123", Role.ADMIN);

        // Managers
        User marcus = updateOrSaveUser("Marcus Chen", "marcus@techhub.pro", "manager123", Role.MANAGER);
        User elena = updateOrSaveUser("Elena Rodriguez", "elena@gadgetpro.co", "manager123", Role.MANAGER);
        User adminUser = userRepository.findByEmail("admin@nexus.io").orElse(null);

        // Customer
        User daniel = updateOrSaveUser("Daniel Smith", "daniel@nexus.io", "user123", Role.CONSUMER);
        createProfile(daniel, "Shadow Coder", "Dark, matte setups with high-performance mechanics.", "25-34", "San Francisco", "Senior Software Engineer", "Mechanical Keyboards, Dark Mode Aesthetics, Vim", "Gold", "2024-01-10: Bronze to Silver (Initial purchases); 2024-03-15: Silver to Gold (Consistent high-value orders)");

        User sophia = updateOrSaveUser("Sophia Chen", "sophia@nexus.io", "user123", Role.CONSUMER);
        createProfile(sophia, "Organic Creator", "Natural textures, warm lighting, and acoustic perfection.", "18-24", "Seattle", "Digital Content Creator", "Walnut Accessories, Studio Lighting, Audiophile Gear", "Silver", "2024-02-05: Joined Bronze; 2024-04-20: Silver (Reached spend threshold)");

        User liam = updateOrSaveUser("Liam Wright", "liam@nexus.io", "user123", Role.CONSUMER);
        createProfile(liam, "Global Nomad", "High-efficiency gadgets that fit in a single tech pouch.", "35-44", "Austin", "Technical Product Manager", "EDC, Solar Tech, Minimalist Travel, Noise Cancelling", "Bronze", "2024-05-01: Joined Bronze");

        User maya = updateOrSaveUser("Maya Rossi", "maya@nexus.io", "user123", Role.CONSUMER);
        createProfile(maya, "The Discovery", "Unique, experimental gadgets that defy common physics.", "25-34", "New York", "UX Designer", "Futuristic Lighting, Kinetic Art, Transparent Tech", "Gold", "2023-11-15: Bronze; 2024-02-12: Gold (Special Promotion Reward)");

        User test = updateOrSaveUser("Test User", "daniel@test.com", "password", Role.CONSUMER);
        createProfile(test, "All-Rounder", "A bit of everything for the ultimate workspace.", "25-34", "London", "DevOps Engineer", "Cloud Infrastructure, Ultrawide Monitors, Ergonomic Chairs", "Premium", "2024-01-01: Joined Premium Plan");

        // Stores
        storeRepository.save(Store.builder().name("Nexus Central").ownerName("Nexus Admin")
                .ownerId(adminUser != null ? adminUser.getUserId() : null).totalRevenue(500000.0).orderCount(12000)
                .rating(5.0).status("OPEN").build());
        storeRepository
                .save(Store.builder().name("TechHub Performance").ownerName("Marcus Chen").ownerId(marcus.getUserId())
                        .totalRevenue(285000.0).orderCount(4500).rating(4.8).status("OPEN").build());
        storeRepository.save(Store.builder().name("GadgetPro Lifestyle").ownerName("Elena Rodriguez")
                .ownerId(elena.getUserId()).totalRevenue(195000.0).orderCount(2800).rating(4.9).status("OPEN").build());
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
    private void createProfile(User user, String persona, String bio, String ageRange, String city, String occupation,
            String interests, String membershipType, String history) {
        CustomerProfile profile = CustomerProfile.builder()
                .user(user)
                .persona(persona)
                .personaType(persona)
                .bio(bio)
                .ageRange(ageRange)
                .city(city)
                .occupation(occupation)
                .interests(interests)
                .membershipType(membershipType)
                .membershipHistory(history)
                .totalSpend(java.math.BigDecimal.ZERO)
                .itemsPurchased(0)
                .preferredStyle("Minimalist")
                .satisfactionLevel("Satisfied")
                .daysOnPlatform(new Random().nextInt(365))
                .build();
        profileRepository.save(profile);
    }

    public void seedSpecifications() {
        System.out.println("SEED: Adding detailed technical specifications to products...");
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            String cat = p.getCategory();
            if ("Keyboards".equalsIgnoreCase(cat)) {
                addSpec(p, "switch_type", "Mechanical (Linear Red)");
                addSpec(p, "backlight", "Per-key RGB (16.8M Colors)");
                addSpec(p, "polling_rate", "1000Hz");
                addSpec(p, "connection", "USB-C Braided / Wireless 2.4GHz");
            } else if ("Mice".equalsIgnoreCase(cat)) {
                addSpec(p, "sensor_type", "Optical Precision (26K DPI)");
                addSpec(p, "weight", "63g (Ultra-lightweight)");
                addSpec(p, "battery_life", "70 Hours");
                addSpec(p, "connection", "Wireless / Wired Dual-Mode");
            } else if ("Monitors".equalsIgnoreCase(cat)) {
                addSpec(p, "refresh_rate", "144Hz - 240Hz");
                addSpec(p, "panel_type", "OLED / IPS Black");
                addSpec(p, "resolution", "4K Ultra HD");
                addSpec(p, "brightness", "600 nits (HDR)");
            } else if ("Audio".equalsIgnoreCase(cat)) {
                addSpec(p, "driver_type", "Neodymium 50mm / Planar Magnetic");
                addSpec(p, "frequency_response", "10Hz - 40kHz");
                addSpec(p, "connectivity", "XLR / Bluetooth 5.3 / USB-C");
                addSpec(p, "noise_isolation", "Passive / AI Active ANC");
            } else if ("Mobility".equalsIgnoreCase(cat)) {
                addSpec(p, "material", "Waterproof Ballistic Nylon / Carbon Fiber");
                addSpec(p, "weight", "850g");
                addSpec(p, "compatibility", "Universal Tech Pouch System");
            } else {
                addSpec(p, "quality_grade", "Premium Tier A+");
                addSpec(p, "warranty", "2-Year Global Protection");
                addSpec(p, "design_language", "Minimalist / Industrial");
            }
            productRepository.save(p);
        }
    }

    private void seedCategories() {
        System.out.println("SEED: Initializing category hierarchy...");

        // Root Categories
        Category tech = createCategory("Technology", "High-performance tech and gadgets", null);
        Category lifestyle = createCategory("Lifestyle", "Home decor and aesthetic items", null);
        createCategory("Mobility", "Travel and high-efficiency mobility gear", null);

        // Technology Subcategories
        Category accessories = createCategory("Accessories", "Workspace and tech accessories", tech);
        createCategory("Keyboards", "Mechanical and membrane keyboards", accessories);
        createCategory("Mice", "Precision and ergonomic mice", accessories);
        createCategory("Monitors", "High-resolution display solutions", accessories);
        createCategory("Storage", "High-speed external storage", accessories);

        // Lifestyle Subcategories
        createCategory("Audio", "Premium audio equipment", lifestyle);
        createCategory("Lighting", "Aesthetic and functional lighting", lifestyle);
        createCategory("Art", "Kinetic art and science-fiction pieces", lifestyle);
    }

    private Category createCategory(String name, String desc, Category parent) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        c.setParent(parent);
        c.setActive(true);
        return categoryRepository.save(c);
    }

    private void addSpec(Product p, String key, String value) {
        p.getSpecifications().add(ProductSpecification.builder()
                .key(key)
                .value(value)
                .product(p)
                .build());
    }

    public void seedShippingInfo() {
        System.out.println("SEED: Adding shipping information...");
        List<Product> products = productRepository.findAll();
        for (Product p : products) {
            double price = p.getBasePrice().doubleValue();
            if (price > 1000) {
                addShipping(p, "Nexus Express Premium", 1, 0.0, "Domestic");
            } else if (price > 500) {
                addShipping(p, "Standard FastLog", 2, 0.0, "Domestic");
            } else {
                addShipping(p, "Economy Ship", 4, 15.0, "Domestic");
            }
            productRepository.save(p);
        }
    }

    private void addShipping(Product p, String carrier, int days, double cost, String region) {
        ShippingInfo info = ShippingInfo.builder()
                .carrierName(carrier)
                .estimatedDays(days)
                .shippingCost(cost)
                .shippingRegion(region)
                .isFreeShipping(cost == 0)
                .product(p)
                .build();
        p.setShippingInfo(info);
    }

    private Product createProduct(String name, String cat, String brand, double price, String desc, String img,
            String tags, Store store) {
        Product p = new Product();
        p.setName(name);
        p.setCategory(cat);
        p.setBrand(brand);
        p.setBasePrice(java.math.BigDecimal.valueOf(price));
        // Supplier price is roughly 65% of base price for realistic profit analysis
        p.setSupplierPrice(java.math.BigDecimal.valueOf(price * 0.65));
        p.setDescription(desc);
        p.setImageUrl(img);
        p.setTags(tags);
        p.setStore(store);
        return p;
    }
}
