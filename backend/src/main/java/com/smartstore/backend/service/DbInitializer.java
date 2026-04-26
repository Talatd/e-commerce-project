package com.smartstore.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstore.backend.repository.*;
import com.smartstore.backend.model.*;
import com.smartstore.backend.model.Order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final CustomerProfileRepository profileRepository;
    private final OrderEventRepository orderEventRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final ShipmentRepository shipmentRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @jakarta.annotation.PostConstruct
    @jakarta.transaction.Transactional
    public void init() {
        System.out.println("ETL: Force-loading core data from sources...");
        seedUsersAndStoresFromSource();
        // Clean sweep runs inside Users/Stores seeding, so categories must be loaded after.
        seedCategoriesFromSource();
        seedProductsFromSource();
        seedSpecifications();
        seedShippingInfo();
        seedReviews();

        if (couponRepository.count() == 0) {
            seedCoupons();
        }

        if (orderRepository.count() == 0) {
            seedHistoricalData();
        }
        System.out.println("SEED: Initialization complete.");
    }

    private void seedCategoriesFromSource() {
        try {
            InputStream is = getClass().getResourceAsStream("/data/categories.json");
            if (is == null)
                return;
            List<Map<String, String>> raw = objectMapper.readValue(is, new TypeReference<List<Map<String, String>>>() {
            });
            for (Map<String, String> item : raw) {
                if (categoryRepository.findByName(item.get("name")).isEmpty()) {
                    Category c = new Category();
                    c.setName(item.get("name"));
                    c.setDescription(item.get("description"));
                    c.setActive(true);
                    categoryRepository.save(c);
                }
            }
        } catch (Exception e) {
            System.err.println("ETL ERROR (Categories): " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private void seedUsersAndStoresFromSource() {
        try {
            System.out.println("ETL: Performing clean sweep and loading Users/Stores...");
            performCleanSweep();

            updateOrSaveUser("Nexus Admin", "admin@nexus.io", "admin123", Role.ADMIN);

            InputStream is = getClass().getResourceAsStream("/data/users.json");
            if (is == null)
                return;
            List<Map<String, Object>> users = objectMapper.readValue(is,
                    new TypeReference<List<Map<String, Object>>>() {
                    });
            for (Map<String, Object> uMap : users) {
                User u = updateOrSaveUser((String) uMap.get("fullName"), (String) uMap.get("email"),
                        (String) uMap.get("password"), Role.valueOf((String) uMap.get("role")));
                if (uMap.containsKey("profile")) {
                    Map<String, String> p = (Map<String, String>) uMap.get("profile");
                    createProfile(u, p.get("persona"), p.get("bio"), p.get("ageRange"), p.get("city"),
                            p.get("occupation"), p.get("interests"), p.get("membershipType"), p.get("history"));
                }
            }

            InputStream sis = getClass().getResourceAsStream("/data/stores.json");
            if (sis == null)
                return;
            List<Map<String, String>> stores = objectMapper.readValue(sis,
                    new TypeReference<List<Map<String, String>>>() {
                    });
            for (Map<String, String> sMap : stores) {
                User owner = userRepository.findByEmail(sMap.get("ownerEmail")).orElse(null);
                Store store = Store.builder()
                        .name(sMap.get("name"))
                        .ownerName(owner != null ? owner.getFullName() : "Admin")
                        .ownerId(owner != null ? owner.getUserId() : 1L)
                        .description(sMap.get("description"))
                        .totalRevenue(150000.0 + new Random().nextInt(100000))
                        .orderCount(1000 + new Random().nextInt(2000))
                        .rating(4.5 + new Random().nextDouble() * 0.5)
                        .status("OPEN")
                        .build();
                storeRepository.save(Objects.requireNonNull(store));
            }
        } catch (Exception e) {
            System.err.println("ETL ERROR (Users/Stores): " + e.getMessage());
        }
    }

    private void seedProductsFromSource() {
        try {
            System.out.println("ETL: Transforming and Loading Products...");
            InputStream is = getClass().getResourceAsStream("/data/products.json");
            if (is == null)
                return;
            List<Map<String, Object>> raw = objectMapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {
            });
            List<Product> products = new ArrayList<>();
            Random random = new Random();

            for (Map<String, Object> pMap : raw) {
                Store store = storeRepository.findByName((String) pMap.get("storeName"))
                        .orElse(storeRepository.findAll().get(0));
                BigDecimal price = BigDecimal.valueOf(((Number) pMap.get("price")).doubleValue());

                String bundleRole = (String) pMap.get("bundleRole");
                if (bundleRole == null || bundleRole.isBlank()) {
                    Object isAnchor = pMap.get("isAnchor");
                    boolean anchor = Boolean.TRUE.equals(isAnchor);
                    bundleRole = anchor ? "ANCHOR" : "ACCESSORY";
                }

                String compatibleWith = null;
                Object cw = pMap.get("compatibleWith");
                if (cw instanceof List<?> lst) {
                    compatibleWith = lst.stream().filter(Objects::nonNull).map(Object::toString).map(String::trim)
                            .filter(s -> !s.isBlank()).reduce((a, b) -> a + "," + b).orElse(null);
                } else if (cw instanceof String s) {
                    compatibleWith = s;
                } else {
                    Object at = pMap.get("anchorTarget");
                    if (at != null) compatibleWith = at.toString();
                }

                Integer bundleRank = null;
                Object br = pMap.get("bundleRank");
                if (br instanceof Number n) {
                    bundleRank = n.intValue();
                } else if (br instanceof String s) {
                    try {
                        bundleRank = Integer.valueOf(s.trim());
                    } catch (Exception ignore) {
                    }
                }

                String bundleRankByAnchor = null;
                Object brm = pMap.get("bundleRankByAnchor");
                if (brm instanceof Map<?, ?> m) {
                    try {
                        bundleRankByAnchor = objectMapper.writeValueAsString(m);
                    } catch (Exception ignore) {
                    }
                }

                String seedKey = (String) pMap.get("seedKey");
                if (seedKey != null) seedKey = seedKey.trim();

                String bundleIncludes = null;
                Object bi = pMap.get("bundleIncludes");
                if (bi instanceof List<?> lst) {
                    bundleIncludes = lst.stream().filter(Objects::nonNull).map(Object::toString).map(String::trim)
                            .filter(s -> !s.isBlank()).reduce((a, b) -> a + "," + b).orElse(null);
                } else if (bi instanceof String s) {
                    bundleIncludes = s.trim();
                }

                Product p = Product.builder()
                        .name((String) pMap.get("name"))
                        .category((String) pMap.get("category"))
                        .brand((String) pMap.get("brand"))
                        .basePrice(price)
                        .supplierPrice(price.multiply(BigDecimal.valueOf(0.65)))
                        .description((String) pMap.get("description"))
                        .imageUrl((String) pMap.get("imageUrl"))
                        .tags((String) pMap.get("tags"))
                        .bundleRole(bundleRole)
                        .compatibleWith(compatibleWith)
                        .bundleRank(bundleRank)
                        .bundleRankByAnchor(bundleRankByAnchor)
                        .seedKey(seedKey)
                        .bundleIncludes(bundleIncludes)
                        .store(store)
                        .stockQuantity(50)
                        .build();
                products.add(p);
            }

            List<Product> saved = productRepository.saveAll(products);
            for (Product p : saved) {
                seedInventory(p, random);
            }
        } catch (Exception e) {
            System.err.println("ETL ERROR (Products): " + e.getMessage());
        }
    }

    public void seedReviews() {
        System.out.println("ETL: Generating procedural product reviews and sentiment data...");
        List<Product> products = productRepository.findAll();
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CONSUMER)
                .toList();

        String[] positiveReviews = {
                "Absolutely stunning design. Fits my minimalist setup perfectly!",
                "The build quality is top-notch. Worth every penny.",
                "Fast shipping and incredible performance. Highly recommend to anyone.",
                "Nexus never disappoints. The materials feel premium and durable.",
                "Exactly what I was looking for. The attention to detail is amazing."
        };

        String[] neutralReviews = {
                "Good product overall, but the shipping took a bit longer than expected.",
                "Functional and sleek, though the price point is a bit high.",
                "It works well, but I expected slightly better tactile feedback.",
                "Nice addition to my desk, but the color is slightly different from the photos."
        };

        Random random = new Random();
        for (Product p : products) {
            int count = 3 + random.nextInt(8);
            double totalRating = 0;

            for (int i = 0; i < count; i++) {
                User user = customers.get(random.nextInt(customers.size()));
                ProductReview review = new ProductReview();
                review.setProduct(p);
                review.setUser(user);

                int rating = 4 + random.nextInt(2);
                if (random.nextDouble() > 0.8)
                    rating = 3;

                String comment = (rating >= 4) ? positiveReviews[random.nextInt(positiveReviews.length)]
                        : neutralReviews[random.nextInt(neutralReviews.length)];

                review.setRating(rating);
                review.setComment(comment);
                review.setSentimentScore(BigDecimal.valueOf(0.5 + (rating - 3) * 0.2 + (random.nextDouble() * 0.1)));

                reviewRepository.save(review);
                totalRating += rating;
            }

            p.setReviewCount(count);
            p.setRating(totalRating / count);
            productRepository.save(p);
        }
    }

    private void performCleanSweep() {
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
    }

    private void seedInventory(Product p, Random random) {
        inventoryRepository.save(Objects
                .requireNonNull(RegionalInventory.builder().product(p).region("Global").stockQuantity(50).build()));
        inventoryRepository.save(Objects.requireNonNull(RegionalInventory.builder().product(p).region("Europe")
                .stockQuantity(20 + random.nextInt(30)).build()));
        inventoryRepository.save(Objects.requireNonNull(
                RegionalInventory.builder().product(p).region("Asia").stockQuantity(10 + random.nextInt(40)).build()));
    }

    public void seedSpecifications() {
        System.out.println("ETL: Adding detailed technical specifications...");
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

    private void addSpec(Product p, String key, String value) {
        p.getSpecifications().add(ProductSpecification.builder()
                .key(key)
                .value(value)
                .product(p)
                .build());
    }

    public void seedShippingInfo() {
        System.out.println("ETL: Adding shipping information...");
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
                .totalSpend(BigDecimal.ZERO)
                .itemsPurchased(0)
                .preferredStyle("Minimalist")
                .satisfactionLevel("Satisfied")
                .daysOnPlatform(new Random().nextInt(365))
                .build();
        profileRepository.save(Objects.requireNonNull(profile));
    }

    private void seedCoupons() {
        Coupon c1 = new Coupon();
        c1.setCode("NEXUS20");
        c1.setPercentOff(20);
        c1.setActive(true);
        c1.setExpiresAt(LocalDateTime.now().plusYears(3));
        couponRepository.save(c1);

        Coupon c2 = new Coupon();
        c2.setCode("TECH30");
        c2.setPercentOff(30);
        c2.setRestrictedCategory("Technology");
        c2.setActive(true);
        c2.setExpiresAt(LocalDateTime.now().plusYears(1));
        couponRepository.save(c2);
    }

    private void seedHistoricalData() {
        System.out.println("SEED: Generating historical analytics data...");
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CONSUMER)
                .toList();
        List<Product> products = productRepository.findAll();
        Random random = new Random();

        for (int i = 0; i < 50; i++) {
            User customer = customers.get(random.nextInt(customers.size()));
            Product product = products.get(random.nextInt(products.size()));

            Order order = new Order();
            order.setUser(customer);
            order.setOrderDate(LocalDateTime.now().minusDays(random.nextInt(30)));
            BigDecimal base = product.getBasePrice();
            order.setSubtotalAmount(base);
            order.setTaxAmount(base.multiply(BigDecimal.valueOf(0.1)));
            order.setShippingAmount(BigDecimal.valueOf(15.0));
            order.setTotalAmount(order.getSubtotalAmount().add(order.getTaxAmount()).add(order.getShippingAmount()));
            order.setShippingAddress(customer.getFullName() + "'s Home, " + new String[] { "San Francisco", "Seattle", "Austin", "New York" }[random.nextInt(4)]);

            OrderStatus[] statuses = OrderStatus.values();
            order.setStatus(statuses[random.nextInt(statuses.length)]);

            Order savedOrder = orderRepository.save(order);
            seedOrderEvents(savedOrder);
            seedShipmentForOrder(savedOrder, random);
        }
    }

    private void seedOrderEvents(Order order) {
        OrderEvent e1 = new OrderEvent();
        e1.setOrder(order);
        e1.setStatus(order.getStatus().name());
        e1.setNotes("Order received and pending payment verification.");
        e1.setEventDate(order.getOrderDate());
        orderEventRepository.save(e1);

        if (order.getStatus() != OrderStatus.PENDING) {
            OrderEvent e2 = new OrderEvent();
            e2.setOrder(order);
            e2.setStatus(OrderStatus.PROCESSING.name());
            e2.setNotes("Payment verified. Warehouse team is preparing your items.");
            e2.setEventDate(order.getOrderDate().plusHours(2));
            orderEventRepository.save(e2);
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            OrderEvent e3 = new OrderEvent();
            e3.setOrder(order);
            e3.setStatus(OrderStatus.SHIPPED.name());
            e3.setNotes("Package has been handed over to the carrier.");
            e3.setEventDate(order.getOrderDate().plusHours(24));
            orderEventRepository.save(e3);
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            OrderEvent e4 = new OrderEvent();
            e4.setOrder(order);
            e4.setStatus(OrderStatus.DELIVERED.name());
            e4.setNotes("Package successfully delivered to recipient.");
            e4.setEventDate(order.getOrderDate().plusDays(3));
            orderEventRepository.save(e4);
        }
    }

    private void seedShipmentForOrder(Order order, Random random) {
        if (order.getStatus() == OrderStatus.PENDING)
            return;
        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setWarehouseBlock(new String[] { "A-14", "B-02", "C-09", "D-22", "E-05" }[random.nextInt(5)]);
        shipment.setModeOfShipment(new String[] { "Road", "Flight", "Ship" }[random.nextInt(3)]);
        shipment.setCarrier(
                new String[] { "Nexus Logistics", "Global Express", "Prime Delivery", "Swift Carrier" }[random
                        .nextInt(4)]);
        shipment.setTrackingNumber("NX-" + (100000 + random.nextInt(900000)));
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
        }
        shipmentRepository.save(shipment);
    }
}
