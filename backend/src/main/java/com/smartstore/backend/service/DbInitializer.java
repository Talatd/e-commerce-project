package com.smartstore.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartstore.backend.repository.*;
import com.smartstore.backend.model.*;
import com.smartstore.backend.model.Order.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
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
            List<String> knownImages = new ArrayList<>();

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

                String img = (String) pMap.get("imageUrl");
                if (img != null && !img.isBlank()) {
                    knownImages.add(img.trim());
                }
            }

            // Also load any additional images from resource list (generated from frontend/public/products).
            knownImages.addAll(loadExtraProductImages());

            // If the source JSON is intentionally small, expand the catalog with deterministic synthetic items
            // so the UI has a richer dataset in local/dev demos.
            final int targetCount = 65;
            if (products.size() < targetCount) {
                List<Store> stores = storeRepository.findAll();
                List<String> categories = categoryRepository.findAll().stream()
                        .map(Category::getName)
                        .filter(Objects::nonNull)
                        .distinct()
                        .toList();
                if (categories.isEmpty()) {
                    categories = List.of("Keyboards", "Mice", "Monitors", "Audio", "Mobility", "Accessories");
                }
                // Keep the UI brand filter clean: distribute across the "top 4" seeded brands.
                List<String> brands = List.of("VANGUARD", "LOOM & LEAF", "AURA", "NOVA");

                int i = 1;
                while (products.size() < targetCount) {
                    Store store = stores.isEmpty()
                            ? null
                            : stores.get(random.nextInt(stores.size()));
                    String brand = brands.get(products.size() % brands.size());

                    String imageUrl = null;
                    if (!knownImages.isEmpty()) {
                        imageUrl = knownImages.get(products.size() % knownImages.size());
                    }

                    // Derive name + category from the image filename when possible (keeps UI consistent).
                    String derivedName = deriveNameFromImageUrl(imageUrl);
                    String derivedCategory = deriveCategoryFromImageUrl(imageUrl);
                    String category = (derivedCategory != null) ? derivedCategory : categories.get(random.nextInt(categories.size()));

                    // Price ranges: keep realistic for the category.
                    double min = switch (category.toLowerCase()) {
                        case "keyboards" -> 89;
                        case "mice" -> 49;
                        case "monitors" -> 249;
                        case "audio" -> 79;
                        case "mobility" -> 39;
                        default -> 29;
                    };
                    double max = switch (category.toLowerCase()) {
                        case "keyboards" -> 299;
                        case "mice" -> 199;
                        case "monitors" -> 1499;
                        case "audio" -> 799;
                        case "mobility" -> 249;
                        default -> 159;
                    };
                    double priceRaw = min + (random.nextDouble() * (max - min));
                    BigDecimal price = BigDecimal.valueOf(Math.round(priceRaw * 100.0) / 100.0);

                    Product p = Product.builder()
                            .name((derivedName != null && !derivedName.isBlank())
                                    ? derivedName
                                    : String.format("%s %s %02d", brand, category, i++))
                            .category(category)
                            .brand(brand)
                            .basePrice(price)
                            .supplierPrice(price.multiply(BigDecimal.valueOf(0.65)))
                            .description("A premium " + category + " item designed for modern setups.")
                            .imageUrl(imageUrl)
                            .tags("Seeded,Synthetic")
                            .bundleRole("ACCESSORY")
                            .compatibleWith("ANY")
                            .store(store)
                            .stockQuantity(25 + random.nextInt(150))
                            .build();
                    products.add(p);
                }
            }

            // Normalize all products to the top-4 brands so the sidebar doesn't get noisy.
            // (Existing JSON products already use these brands, but synthetic ones might not.)
            List<String> allowedBrands = List.of("VANGUARD", "LOOM & LEAF", "AURA", "NOVA");
            for (int idx = 0; idx < products.size(); idx++) {
                Product p = products.get(idx);
                String b = p.getBrand();
                if (b == null || b.isBlank() || allowedBrands.stream().noneMatch(x -> x.equalsIgnoreCase(b.trim()))) {
                    p.setBrand(allowedBrands.get(idx % allowedBrands.size()));
                } else {
                    // Ensure consistent casing in UI
                    String normalized = allowedBrands.stream().filter(x -> x.equalsIgnoreCase(b.trim())).findFirst().orElse(b);
                    p.setBrand(normalized);
                }
            }

            // Force a few items to be out of stock for UX/demo and to validate filters.
            // Pick stable indices so the result is deterministic across restarts.
            int[] oosIdx = new int[] { 3, 17, 42 };
            for (int idx : oosIdx) {
                if (idx >= 0 && idx < products.size()) {
                    products.get(idx).setStockQuantity(0);
                }
            }

            List<Product> saved = productRepository.saveAll(products);

            // Guard: ensure products are distributed across all seeded stores (demo UX expects 2 stores).
            // If an upstream seed mismatch maps everything to the first store, rebalance deterministically.
            List<Store> allStores = storeRepository.findAll();
            if (allStores.size() >= 2) {
                Map<Long, Integer> counts = new HashMap<>();
                for (Product p : saved) {
                    Long sid = (p.getStore() != null) ? p.getStore().getId() : null;
                    if (sid != null) counts.put(sid, counts.getOrDefault(sid, 0) + 1);
                }

                // Find stores that have zero products.
                List<Store> emptyStores = allStores.stream()
                        .filter(s -> s != null && s.getId() != null && counts.getOrDefault(s.getId(), 0) == 0)
                        .toList();

                if (!emptyStores.isEmpty()) {
                    // Reassign every other product to empty stores (round-robin) so each store has a catalog.
                    int idx = 0;
                    for (int i = 0; i < saved.size(); i++) {
                        if (i % 2 == 1) {
                            Store target = emptyStores.get(idx % emptyStores.size());
                            saved.get(i).setStore(target);
                            idx++;
                        }
                    }
                    saved = productRepository.saveAll(saved);
                }
            }

            for (Product p : saved) {
                seedInventory(p, random);
            }
        } catch (Exception e) {
            System.err.println("ETL ERROR (Products): " + e.getMessage());
        }
    }

    private List<String> loadExtraProductImages() {
        try (InputStream is = getClass().getResourceAsStream("/data/product_images.txt")) {
            if (is == null) return List.of();
            String raw = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            return raw.lines()
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .distinct()
                    .toList();
        } catch (Exception ignore) {
            return List.of();
        }
    }

    private static String deriveNameFromImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        String s = imageUrl.trim();
        int slash = s.lastIndexOf('/');
        String file = slash >= 0 ? s.substring(slash + 1) : s;
        file = file.replaceAll("\\.(png|jpg|jpeg|webp|svg)$", "");

        // Normalize separators and repeated tokens.
        file = file.replace('_', ' ').replace('-', ' ').trim();
        file = file.replaceAll("\\s+", " ");
        file = file.replaceAll("(?i)\\bedc\\s+edc\\b", "EDC");

        // Title-case with a few common acronyms.
        Set<String> keepUpper = Set.of("SSD", "EDC", "RGB", "OLED", "USB", "ANC", "VU", "GAN");
        StringBuilder out = new StringBuilder();
        for (String part : file.split(" ")) {
            if (part.isBlank()) continue;
            String up = part.toUpperCase(Locale.ROOT);
            String token;
            if (keepUpper.contains(up)) token = up;
            else token = part.substring(0, 1).toUpperCase(Locale.ROOT) + part.substring(1).toLowerCase(Locale.ROOT);
            if (!out.isEmpty()) out.append(' ');
            out.append(token);
        }
        return out.toString();
    }

    private static String deriveCategoryFromImageUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        String s = imageUrl.toLowerCase(Locale.ROOT);
        if (s.contains("keyboard") || s.contains("keycaps") || s.contains("board")) return "Keyboards";
        if (s.contains("mouse")) return "Mice";
        if (s.contains("monitor") || s.contains("oled") || s.contains("display")) return "Monitors";
        if (s.contains("headphone") || s.contains("speaker") || s.contains("mic") || s.contains("audio")
                || s.contains("vu-meter") || s.contains("music")) return "Audio";
        if (s.contains("pouch") || s.contains("backpack") || s.contains("sleeve") || s.contains("power-bank")
                || s.contains("adapter") || s.contains("charger")) return "Mobility";
        // Everything else is accessories / desk gear.
        return "Accessories";
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

        if (customers.isEmpty() || products.isEmpty()) {
            System.out.println("SEED: Skipping historical analytics generation (customers=" + customers.size()
                    + ", products=" + products.size() + ").");
            return;
        }

        for (int i = 0; i < 50; i++) {
            User customer = customers.get(random.nextInt(customers.size()));

            Order order = new Order();
            order.setUser(customer);
            order.setOrderDate(LocalDateTime.now().minusDays(random.nextInt(30)));
            
            // Seed 1–3 order items so Orders UI can render details.
            int itemCount = 1 + random.nextInt(3);
            List<OrderItem> items = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;
            for (int k = 0; k < itemCount; k++) {
                Product product = products.get(random.nextInt(products.size()));
                int qty = 1 + random.nextInt(2);
                BigDecimal price = product.getBasePrice();
                OrderItem it = new OrderItem();
                it.setOrder(order);
                it.setProduct(product);
                it.setQuantity(qty);
                it.setPriceAtPurchase(price);
                items.add(it);
                subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(qty)));
            }
            order.setItems(items);
            order.setSubtotalAmount(subtotal);
            order.setTaxAmount(subtotal.multiply(BigDecimal.valueOf(0.1)));
            order.setShippingAmount(BigDecimal.valueOf(15.0));
            order.setTotalAmount(order.getSubtotalAmount().add(order.getTaxAmount()).add(order.getShippingAmount()));
            order.setShippingAddress(customer.getFullName() + "'s Home, " + new String[] { "San Francisco", "Seattle", "Austin", "New York" }[random.nextInt(4)]);

            OrderStatus[] statuses = OrderStatus.values();
            // Ensure at least one visible PENDING order in the demo list.
            if (i == 0) {
                order.setStatus(OrderStatus.PENDING);
            } else {
                order.setStatus(statuses[random.nextInt(statuses.length)]);
            }

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
