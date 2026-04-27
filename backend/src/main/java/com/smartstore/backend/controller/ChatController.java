package com.smartstore.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.smartstore.backend.model.AuditLog;
import com.smartstore.backend.repository.AuditLogRepository;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.model.User;
import com.smartstore.backend.security.AiResponseGuardrail;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Proxy to the AI chatbot service with role-based access")
public class ChatController {

    private final com.smartstore.backend.repository.UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final AuditLogRepository auditLogRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Value("${smartstore.ai.url:http://localhost:8000}")
    private String aiServiceUrl;

    @PostMapping("/ask")
    @Operation(summary = "Ask the AI chatbot", description = "Forwards the question to the AI service with user context.")
    public ResponseEntity<Map<String, Object>> ask(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "blocked", true,
                    "detection_type", "authorization",
                    "guardrail", "AUTH_REQUIRED",
                    "response", "Authentication required.",
                    "sql", "",
                    "data", List.of()
            ));
        }
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Long sessionStoreId = resolveSessionStoreId(user);

        Map<String, Object> safePayload = payload != null ? payload : Map.of();

        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("query", safePayload.get("query"));
        aiRequest.put("user_id", user.getUserId());
        aiRequest.put("role", user.getRole().name());
        aiRequest.put("history", safePayload.getOrDefault("history", List.of()));
        if (sessionStoreId != null) {
            // Sent to the AI service so it can enforce store-scoped data access.
            aiRequest.put("session_store_id", sessionStoreId);
        }
        if (safePayload.containsKey("session_id")) {
            aiRequest.put("session_id", safePayload.get("session_id"));
        }

        RestTemplate restTemplate = new RestTemplate();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    aiServiceUrl + "/api/v1/chatbot/query", aiRequest, Map.class);
            Map<String, Object> safeResponse = response != null ? response : Map.of("error", "Empty response");
            safeResponse = AiResponseGuardrail.enforce(user.getRole(), sessionStoreId, safeResponse);
            recordGuardrailEventIfAny(principal.getUsername(), user.getUserId(), sessionStoreId, payload, safeResponse);
            return ResponseEntity.ok(safeResponse);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "success", false,
                    "response", "AI service is currently unavailable. Please try again later.",
                    "error", e.getMessage()
            ));
        }
    }

    private static boolean looksLikeTopProducts(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean top = s.contains("top") || s.contains("en çok") || s.contains("en cok");
        boolean product = s.contains("product") || s.contains("ürün") || s.contains("urun");
        boolean sell = s.contains("sell") || s.contains("selling") || s.contains("sat");
        return top && product && sell;
    }

    private static boolean looksLikeRecommendLaptop(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean rec = s.contains("recommend") || s.contains("suggest") || s.contains("öner") || s.contains("oner");
        boolean laptop = s.contains("laptop") || s.contains("notebook") || s.contains("bilgisayar");
        boolean budget = s.contains("budget") || s.contains("under") || s.contains("below") || s.contains("$") || s.contains("₺") || s.matches(".*\\d+.*");
        return (rec && laptop) || (laptop && budget);
    }

    private static boolean looksLikeDiscountedItems(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        return s.contains("discount") || s.contains("sale") || s.contains("deal") || s.contains("indirim") || s.contains("kampanya") || s.contains("discounted");
    }

    private static boolean looksLikeAppleSamsungCompare(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean brands = (s.contains("apple") && s.contains("samsung"));
        boolean cmp = s.contains("compare") || s.contains("vs") || s.contains("karşılaştır") || s.contains("karsilastir");
        return brands && cmp;
    }

    private static boolean looksLikeOrderStatus(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean order = s.contains("order") || s.contains("sipariş") || s.contains("siparis");
        boolean status = s.contains("status") || s.contains("durum") || s.contains("tracking") || s.contains("kargo");
        return order && status;
    }

    private static boolean looksLikeLastPurchased(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean last = s.contains("last") || s.contains("latest") || s.contains("recent") || s.contains("en son") || s.contains("son");
        boolean buy = s.contains("bought") || s.contains("purchase") || s.contains("purchased") || s.contains("satın") || s.contains("satin") || s.contains("ald");
        boolean item = s.contains("product") || s.contains("item") || s.contains("ürün") || s.contains("urun");
        return (last && buy) || (last && item && (s.contains("ald") || s.contains("bought") || s.contains("purchase")));
    }

    private static BigDecimal parseBudget(String q) {
        if (q == null) return BigDecimal.ZERO;
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d{2,7})(?:\\s*(?:usd|\\$|₺|try|tl))?", java.util.regex.Pattern.CASE_INSENSITIVE)
                    .matcher(q.replace(",", "").replace(".", ""));
            if (m.find()) {
                return new BigDecimal(m.group(1));
            }
        } catch (Exception ignored) {}
        return BigDecimal.ZERO;
    }

    private static boolean looksLikeAllStoresRevenue(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean allStores = s.contains("all stores") || s.contains("all store") || s.contains("tüm mağaza") || s.contains("tüm mağazalar") || s.contains("tum magaza") || s.contains("tum magazalar");
        boolean revenue = s.contains("revenue") || s.contains("ciro") || s.contains("gelir") || s.contains("sales");
        boolean compare = s.contains("compare") || s.contains("comparison") || s.contains("karşılaştır") || s.contains("karsilastir");
        return allStores && revenue && (compare || s.contains("total"));
    }

    private static boolean looksLikeMoMChange(String q) {
        if (q == null) return false;
        String s = q.toLowerCase();
        boolean change = s.contains("change") || s.contains("changed") || s.contains("değiş") || s.contains("degis") || s.contains("vs");
        boolean lastMonth = s.contains("last month") || s.contains("geçen ay") || s.contains("gecen ay");
        boolean sales = s.contains("sales") || s.contains("revenue") || s.contains("ciro") || s.contains("gelir");
        return change && lastMonth && sales;
    }

    private static BigDecimal nz(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }

    private static BigDecimal itemRevenue(com.smartstore.backend.model.OrderItem it) {
        if (it == null) return BigDecimal.ZERO;
        BigDecimal price = it.getPriceAtPurchase() != null ? it.getPriceAtPurchase() : BigDecimal.ZERO;
        int qty = it.getQuantity() != null ? it.getQuantity() : 0;
        return price.multiply(BigDecimal.valueOf(qty));
    }

    private static LocalDateTime parseFromDateForQuery(String q) {
        if (q == null) return LocalDateTime.now().minusDays(90);
        String s = q.toLowerCase();
        if (s.contains("this month") || s.contains("bu ay")) {
            LocalDateTime now = LocalDateTime.now();
            return LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
        }
        if (s.contains("last month") || s.contains("geçen ay") || s.contains("gecen ay")) {
            LocalDateTime now = LocalDateTime.now().minusMonths(1);
            return LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
        }
        if (s.contains("90 days") || s.contains("90 gün") || s.contains("90 gun")) {
            return LocalDateTime.now().minusDays(90);
        }
        if (s.contains("30 days") || s.contains("30 gün") || s.contains("30 gun")) {
            return LocalDateTime.now().minusDays(30);
        }
        return LocalDateTime.now().minusDays(90);
    }

    @SuppressWarnings("unused")
    private Map<String, Object> tryAnswerFromBackendDb(User user, Long sessionStoreId, String query) {
        boolean isTopProducts = looksLikeTopProducts(query);
        boolean isAllStoresRevenue = looksLikeAllStoresRevenue(query);
        boolean isMoM = looksLikeMoMChange(query);
        boolean isLaptopRec = looksLikeRecommendLaptop(query);
        boolean isDiscounted = looksLikeDiscountedItems(query);
        boolean isBrandCompare = looksLikeAppleSamsungCompare(query);
        boolean isOrderStatus = looksLikeOrderStatus(query);
        boolean isLastPurchased = looksLikeLastPurchased(query);
        if (!isTopProducts && !isAllStoresRevenue && !isMoM && !isLaptopRec && !isDiscounted && !isBrandCompare && !isOrderStatus && !isLastPurchased) return null;

        // --- Universal (safe) shortcuts: work for any authenticated role ---
        if (isLastPurchased) {
            List<com.smartstore.backend.model.Order> myOrders = orderRepository.findByUserIdWithItemsAndProducts(user.getUserId());
            com.smartstore.backend.model.Order last = myOrders.stream()
                    .filter(o -> o != null && o.getOrderDate() != null)
                    .findFirst()
                    .orElse(null);

            if (last == null) {
                return Map.of(
                        "success", true,
                        "session_id", payloadSessionIdFallback(),
                        "query", query,
                        "response", "You don't have any completed purchases yet.",
                        "sql", "Computed from your order history.",
                        "data", List.of(),
                        "visualization", ""
                );
            }

            // De-duplicate items in case JOIN FETCH multiplies rows.
            Map<Long, Map<String, Object>> byProduct = new HashMap<>();
            if (last.getItems() != null) {
                for (var it : last.getItems()) {
                    if (it == null || it.getProduct() == null) continue;
                    var p = it.getProduct();
                    Long pid = p.getProductId();
                    int qty = it.getQuantity() != null ? it.getQuantity() : 0;
                    BigDecimal unit = it.getPriceAtPurchase() != null ? it.getPriceAtPurchase() : p.getBasePrice();

                    Map<String, Object> existing = pid != null ? byProduct.get(pid) : null;
                    if (existing == null) {
                        Map<String, Object> row = new HashMap<>();
                        row.put("orderId", last.getOrderId());
                        row.put("orderDate", last.getOrderDate());
                        row.put("status", last.getStatus() != null ? last.getStatus().name() : "UNKNOWN");
                        row.put("productId", pid);
                        row.put("name", p.getName());
                        row.put("brand", p.getBrand());
                        row.put("category", p.getCategory());
                        row.put("quantity", qty);
                        row.put("unitPrice", unit);
                        if (pid != null) byProduct.put(pid, row);
                    } else {
                        int prev = existing.get("quantity") instanceof Integer i ? i : 0;
                        existing.put("quantity", prev + qty);
                    }
                }
            }
            List<Map<String, Object>> items = new ArrayList<>(byProduct.values());

            String responseText;
            if (items.isEmpty()) {
                responseText = "Your latest order is ORD-" + last.getOrderId() + ", but I couldn't read any items for it.";
            } else if (items.size() == 1) {
                responseText = "Your last purchased item is: " + items.get(0).get("name") + " (ORD-" + last.getOrderId() + ").";
            } else {
                responseText = "Your latest order is ORD-" + last.getOrderId() + ". Items:\n"
                        + items.stream()
                        .map(r -> "- " + r.get("name") + " · qty " + r.get("quantity"))
                        .reduce("", (a, b) -> a + (a.isEmpty() ? "" : "\n") + b);
            }

            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from your latest order (orders + order_items + products).",
                    "data", items,
                    "visualization", ""
            );
        }

        if (isOrderStatus) {
            var my = orderRepository.findByUser(user);
            my.sort((a, b) -> {
                if (a.getOrderDate() == null && b.getOrderDate() == null) return 0;
                if (a.getOrderDate() == null) return 1;
                if (b.getOrderDate() == null) return -1;
                return b.getOrderDate().compareTo(a.getOrderDate());
            });
            List<Map<String, Object>> rows = new ArrayList<>();
            for (var o : my.stream().limit(3).toList()) {
                rows.add(Map.of(
                        "orderId", o.getOrderId(),
                        "status", o.getStatus() != null ? o.getStatus().name() : "UNKNOWN",
                        "totalAmount", o.getTotalAmount(),
                        "orderDate", o.getOrderDate()
                ));
            }
            String responseText = rows.isEmpty()
                    ? "You have no orders yet."
                    : "Here are your latest orders:\n" + rows.stream()
                    .map(r -> "- ORD-" + r.get("orderId") + " · " + r.get("status"))
                    .reduce("", (a, b) -> a + (a.isEmpty() ? "" : "\n") + b);
            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from your orders.",
                    "data", rows,
                    "visualization", ""
            );
        }

        if (isLaptopRec) {
            BigDecimal budget = parseBudget(query);
            List<com.smartstore.backend.model.Product> candidates = new ArrayList<>();
            if (sessionStoreId != null) {
                candidates.addAll(productRepository.findByStore_Id(sessionStoreId, org.springframework.data.domain.Pageable.unpaged()).getContent());
            } else {
                candidates.addAll(productRepository.findByCategory("Computers"));
                if (candidates.isEmpty()) candidates.addAll(productRepository.findByNameContainingIgnoreCase("laptop"));
                if (candidates.isEmpty()) candidates.addAll(productRepository.findByNameContainingIgnoreCase("notebook"));
            }

            candidates = candidates.stream()
                    .filter(p -> p != null && p.getStockQuantity() != null && p.getStockQuantity() > 0)
                    .toList();

            if (budget.compareTo(BigDecimal.ZERO) > 0) {
                candidates = candidates.stream()
                        .filter(p -> p.getBasePrice() != null && p.getBasePrice().compareTo(budget) <= 0)
                        .sorted((a, b) -> b.getBasePrice().compareTo(a.getBasePrice()))
                        .toList();
            } else {
                candidates = candidates.stream()
                        .filter(p -> p.getBasePrice() != null)
                        .sorted((a, b) -> a.getBasePrice().compareTo(b.getBasePrice()))
                        .toList();
            }

            List<Map<String, Object>> rows = new ArrayList<>();
            for (var p : candidates.stream().limit(5).toList()) {
                rows.add(Map.of(
                        "name", p.getName(),
                        "basePrice", p.getBasePrice(),
                        "stockQuantity", p.getStockQuantity(),
                        "brand", p.getBrand(),
                        "category", p.getCategory(),
                        "productId", p.getProductId()
                ));
            }
            String responseText = rows.isEmpty()
                    ? "I couldn't find an in-stock laptop matching your budget. Try increasing the budget or search by brand."
                    : (budget.compareTo(BigDecimal.ZERO) > 0
                    ? "Here are laptop picks under $" + budget + " (closest to your budget first):"
                    : "Here are some laptop recommendations:");
            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from products catalog.",
                    "data", rows,
                    "visualization", ""
            );
        }

        if (isDiscounted) {
            var all = (sessionStoreId != null)
                    ? productRepository.findByStore_Id(sessionStoreId, org.springframework.data.domain.Pageable.unpaged()).getContent()
                    : productRepository.findAll();
            List<com.smartstore.backend.model.Product> inStock = all.stream()
                    .filter(p -> p != null && p.getStockQuantity() != null && p.getStockQuantity() > 0 && p.getBasePrice() != null)
                    .sorted((a, b) -> a.getBasePrice().compareTo(b.getBasePrice()))
                    .limit(5)
                    .toList();
            List<Map<String, Object>> rows = new ArrayList<>();
            for (var p : inStock) {
                rows.add(Map.of(
                        "name", p.getName(),
                        "basePrice", p.getBasePrice(),
                        "stockQuantity", p.getStockQuantity(),
                        "brand", p.getBrand(),
                        "category", p.getCategory(),
                        "productId", p.getProductId()
                ));
            }
            String responseText = rows.isEmpty()
                    ? "No discounted items found right now."
                    : "Here are today’s best deals (lowest price, in stock):";
            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from products sorted by price.",
                    "data", rows,
                    "visualization", ""
            );
        }

        if (isBrandCompare) {
            var all = (sessionStoreId != null)
                    ? productRepository.findByStore_Id(sessionStoreId, org.springframework.data.domain.Pageable.unpaged()).getContent()
                    : productRepository.findAll();
            var apple = all.stream().filter(p -> p != null && p.getBrand() != null && p.getBrand().toLowerCase().contains("apple")).toList();
            var samsung = all.stream().filter(p -> p != null && p.getBrand() != null && p.getBrand().toLowerCase().contains("samsung")).toList();
            java.util.function.Function<List<com.smartstore.backend.model.Product>, BigDecimal> avg = (list) -> {
                var xs = list.stream().filter(p -> p.getBasePrice() != null).toList();
                if (xs.isEmpty()) return BigDecimal.ZERO;
                BigDecimal sum = xs.stream().map(com.smartstore.backend.model.Product::getBasePrice).reduce(BigDecimal.ZERO, BigDecimal::add);
                return sum.divide(BigDecimal.valueOf(xs.size()), 2, java.math.RoundingMode.HALF_UP);
            };
            BigDecimal aAvg = avg.apply(apple);
            BigDecimal sAvg = avg.apply(samsung);

            String responseText =
                    "Apple vs Samsung (catalog snapshot):\n"
                    + "- Apple products: " + apple.size() + " · avg price $" + aAvg + "\n"
                    + "- Samsung products: " + samsung.size() + " · avg price $" + sAvg + "\n"
                    + (aAvg.compareTo(sAvg) > 0 ? "Apple is pricier on average." : aAvg.compareTo(sAvg) < 0 ? "Samsung is pricier on average." : "Both are similar on average.");

            List<Map<String, Object>> rows = new ArrayList<>();
            apple.stream().limit(2).forEach(p -> rows.add(Map.of("name", p.getName(), "basePrice", p.getBasePrice(), "stockQuantity", p.getStockQuantity(), "brand", p.getBrand(), "category", p.getCategory(), "productId", p.getProductId())));
            samsung.stream().limit(2).forEach(p -> rows.add(Map.of("name", p.getName(), "basePrice", p.getBasePrice(), "stockQuantity", p.getStockQuantity(), "brand", p.getBrand(), "category", p.getCategory(), "productId", p.getProductId())));

            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from products grouped by brand (contains match).",
                    "data", rows,
                    "visualization", ""
            );
        }

        LocalDateTime from = parseFromDateForQuery(query);
        List<com.smartstore.backend.model.Order> orders;
        // Manager/store-scoped view: only orders that include products from the manager's store.
        if (user.getRole() == com.smartstore.backend.model.Role.MANAGER) {
            if (!isTopProducts) return null;
            orders = orderRepository.findStoreOrdersByOwnerId(user.getUserId());
        } else if (user.getRole() == com.smartstore.backend.model.Role.ADMIN) {
            // Admin: platform-wide; needs products+store to support store comparison.
            orders = orderRepository.findAllWithItemsAndProducts();
        } else {
            // Consumers shouldn't query store-wide analytics like "top selling products".
            return Map.of(
                    "success", false,
                    "blocked", true,
                    "detection_type", "authorization",
                    "guardrail", "ROLE_SCOPE",
                    "response", "This analytics question is only available for Manager/Admin accounts.",
                    "sql", "",
                    "data", List.of()
            );
        }

        // --- Admin: compare total revenue of all stores ---
        if (isAllStoresRevenue && user.getRole() == com.smartstore.backend.model.Role.ADMIN) {
            Map<String, BigDecimal> revenueByStore = new HashMap<>();
            for (var o : orders) {
                if (o == null || o.getOrderDate() == null || o.getOrderDate().isBefore(from)) continue;
                if (o.getItems() == null) continue;
                for (var it : o.getItems()) {
                    if (it == null || it.getProduct() == null) continue;
                    var st = it.getProduct().getStore();
                    String key = st != null
                            ? (st.getName() != null ? st.getName() : ("Store #" + st.getId()))
                            : "Unknown store";
                    revenueByStore.put(key, nz(revenueByStore.get(key)).add(itemRevenue(it)));
                }
            }

            List<Map<String, Object>> rows = new ArrayList<>();
            revenueByStore.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(10)
                    .forEach(e -> rows.add(Map.of("store", e.getKey(), "revenue", e.getValue())));

            BigDecimal total = revenueByStore.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
            String responseText = rows.isEmpty()
                    ? "No revenue data found for the selected period."
                    : "Revenue by store (top " + rows.size() + "):\n"
                    + rows.stream()
                        .map(r -> "- " + r.get("store") + " · $" + ((BigDecimal) r.get("revenue")).setScale(0, java.math.RoundingMode.HALF_UP))
                        .reduce("", (a, b) -> a + (a.isEmpty() ? "" : "\n") + b)
                    + "\n\nTotal revenue: $" + total.setScale(0, java.math.RoundingMode.HALF_UP);

            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from backend order_items grouped by product.store.",
                    "data", rows,
                    "visualization", ""
            );
        }

        // --- Admin: month-over-month sales change ---
        if (isMoM && user.getRole() == com.smartstore.backend.model.Role.ADMIN) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime thisMonthStart = LocalDateTime.of(now.getYear(), now.getMonth(), 1, 0, 0);
            LocalDateTime lastMonthStart = thisMonthStart.minusMonths(1);
            LocalDateTime lastMonthEnd = thisMonthStart.minus(1, ChronoUnit.SECONDS);

            BigDecimal thisMonth = BigDecimal.ZERO;
            BigDecimal lastMonth = BigDecimal.ZERO;

            for (var o : orders) {
                if (o == null || o.getOrderDate() == null) continue;
                if (o.getItems() == null) continue;
                BigDecimal orderRevenue = BigDecimal.ZERO;
                for (var it : o.getItems()) {
                    if (it == null) continue;
                    orderRevenue = orderRevenue.add(itemRevenue(it));
                }
                if (!o.getOrderDate().isBefore(thisMonthStart)) {
                    thisMonth = thisMonth.add(orderRevenue);
                } else if (!o.getOrderDate().isBefore(lastMonthStart) && !o.getOrderDate().isAfter(lastMonthEnd)) {
                    lastMonth = lastMonth.add(orderRevenue);
                }
            }

            String pct;
            if (lastMonth.compareTo(BigDecimal.ZERO) == 0) {
                pct = thisMonth.compareTo(BigDecimal.ZERO) == 0 ? "0%" : "N/A (no last-month baseline)";
            } else {
                BigDecimal change = thisMonth.subtract(lastMonth)
                        .divide(lastMonth, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                pct = change.setScale(1, java.math.RoundingMode.HALF_UP) + "%";
            }

            String responseText =
                    "Month-over-month revenue change:\n"
                    + "- This month: $" + thisMonth.setScale(0, java.math.RoundingMode.HALF_UP) + "\n"
                    + "- Last month: $" + lastMonth.setScale(0, java.math.RoundingMode.HALF_UP) + "\n"
                    + "- Change: " + pct;

            return Map.of(
                    "success", true,
                    "session_id", payloadSessionIdFallback(),
                    "query", query,
                    "response", responseText,
                    "sql", "Computed from backend order_items totals by orderDate month.",
                    "data", List.of(
                            Map.of("month", "this", "revenue", thisMonth),
                            Map.of("month", "last", "revenue", lastMonth)
                    ),
                    "visualization", ""
            );
        }

        // Only compute top products when that intent is detected.
        if (!isTopProducts) return null;

        Map<String, Long> qtyByProduct = new HashMap<>();
        for (var o : orders) {
            if (o == null || o.getOrderDate() == null || o.getOrderDate().isBefore(from)) continue;
            if (o.getItems() == null) continue;
            for (var it : o.getItems()) {
                if (it == null || it.getProduct() == null) continue;
                // Manager: repository already filtered by store owner via product.store; safe here.
                // Admin: include all.
                String name = it.getProduct().getName() != null ? it.getProduct().getName() : "Unknown";
                long qty = it.getQuantity() != null ? it.getQuantity().longValue() : 0L;
                qtyByProduct.put(name, qtyByProduct.getOrDefault(name, 0L) + qty);
            }
        }

        List<Map<String, Object>> rows = new ArrayList<>();
        qtyByProduct.entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .forEach(e -> rows.add(Map.of("name", e.getKey(), "total_qty", e.getValue())));

        String storeLabel = sessionStoreId != null ? ("store #" + sessionStoreId) : "all stores";
        String responseText;
        if (rows.isEmpty()) {
            responseText = "No sales were found for " + storeLabel + " in the selected period. Top 5 selling products: none (0 orders).";
        } else {
            responseText = "Top 5 selling products for " + storeLabel + " (by quantity):\n"
                    + rows.stream().map(r -> "- " + r.get("name") + " · " + r.get("total_qty")).reduce("", (a, b) -> a + (a.isEmpty() ? "" : "\n") + b);
        }

        return Map.of(
                "success", true,
                "session_id", payloadSessionIdFallback(),
                "query", query,
                "response", responseText,
                "sql", "Computed from backend orders + order_items (no Text2SQL execution needed).",
                "data", rows,
                "visualization", ""
        );
    }

    // Keeps response shape similar without requiring a session id from ai-hub.
    private String payloadSessionIdFallback() {
        return java.util.UUID.randomUUID().toString();
    }

    @PostMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream AI chatbot response", description = "SSE stream with agent execution steps for transparency.")
    public SseEmitter askStream(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        SseEmitter emitter = new SseEmitter(60000L);
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Long sessionStoreId = resolveSessionStoreId(user);

        new Thread(() -> {
            try {
                Map<String, Object> reqBody = new HashMap<>();
                reqBody.put("query", payload.get("query"));
                reqBody.put("user_id", user.getUserId());
                reqBody.put("role", user.getRole().name());
                reqBody.put("history", payload.getOrDefault("history", List.of()));
                if (sessionStoreId != null) {
                    reqBody.put("session_store_id", sessionStoreId);
                }
                if (payload.containsKey("session_id")) {
                    reqBody.put("session_id", payload.get("session_id"));
                }
                String jsonBody = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(reqBody);

                URL url = java.net.URI.create(aiServiceUrl + "/api/v1/chatbot/query/stream").toURL();
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setDoOutput(true);
                conn.getOutputStream().write(jsonBody.getBytes(StandardCharsets.UTF_8));

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.startsWith("data: ")) {
                        String eventPayload = Objects.requireNonNull(line.substring(6));
                        // If the AI hub signals a guardrail block in-stream, record it in AuditLog.
                        try {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> parsed = new com.fasterxml.jackson.databind.ObjectMapper()
                                    .readValue(eventPayload, Map.class);
                            recordGuardrailEventIfAny(principal.getUsername(), user.getUserId(), sessionStoreId, eventPayload, parsed);
                        } catch (Exception ignored) {
                            // best effort only; always forward the event to the client
                        }
                        emitter.send(SseEmitter.event().data(eventPayload));
                    }
                }
                reader.close();
                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.send(SseEmitter.event().data(
                            "{\"type\":\"error\",\"message\":\"" + e.getMessage() + "\"}"));
                } catch (Exception ignored) {}
                emitter.complete();
            }
        }).start();

        return emitter;
    }

    private Long resolveSessionStoreId(User user) {
        if (user == null || user.getUserId() == null) return null;
        // Admins can query platform-wide; do not scope by store_id.
        if (user.getRole() == com.smartstore.backend.model.Role.ADMIN) return null;
        return storeRepository.findByOwnerId(user.getUserId())
                .map(s -> s.getId())
                .or(() -> storeRepository.findByOwnerName(user.getFullName()).map(s -> s.getId()))
                .orElse(null);
    }


    private static boolean isTruthy(Object v) {
        if (v == null) return false;
        if (v instanceof Boolean b) return b;
        return "true".equalsIgnoreCase(v.toString().trim());
    }

    private void recordGuardrailEventIfAny(
            String username,
            Long userId,
            Long sessionStoreId,
            Object requestPayload,
            Map<String, Object> aiResponse
    ) {
        if (aiResponse == null) return;

        // We treat responses marked as blocked/guardrail as security audit events.
        boolean blocked = isTruthy(aiResponse.get("blocked")) || isTruthy(aiResponse.get("guardrail_blocked"));
        String detectionType = aiResponse.get("detection_type") != null ? aiResponse.get("detection_type").toString() : null;
        String guardrail = aiResponse.get("guardrail") != null ? aiResponse.get("guardrail").toString() : null;

        if (!blocked && detectionType == null && guardrail == null) return;

        String query = "";
        if (requestPayload instanceof Map<?, ?> m) {
            Object q = m.get("query");
            if (q != null) query = q.toString();
        } else if (requestPayload instanceof String s) {
            query = s;
        }
        // Keep the audit detail short and avoid storing full user text if possible.
        String querySnippet = query.length() > 140 ? query.substring(0, 140) + "…" : query;

        Map<String, Object> detail = new HashMap<>();
        detail.put("user_id", userId);
        detail.put("session_store_id", sessionStoreId);
        if (detectionType != null) detail.put("detection_type", detectionType);
        if (guardrail != null) detail.put("guardrail", guardrail);
        detail.put("action", blocked ? "blocked" : "flagged");
        detail.put("query_snippet", querySnippet);

        String detailJson;
        try {
            detailJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(detail);
        } catch (Exception e) {
            detailJson = detail.toString();
        }

        AuditLog log = AuditLog.builder()
                .username(username)
                .action("AI_GUARDRAIL")
                .type(blocked ? "blocked" : "security")
                .detail(detailJson)
                .build();
        auditLogRepository.save(Objects.requireNonNull(log));
    }
}
