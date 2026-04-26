package com.smartstore.backend.service;

import com.smartstore.backend.dto.CompleteSetupAccessoryDto;
import com.smartstore.backend.dto.CompleteSetupBundleDto;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductSpecification;
import com.smartstore.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompleteSetupService {

    private final ProductRepository productRepository;

    public CompleteSetupBundleDto buildBundle(Long anchorProductId) {
        if (anchorProductId == null) throw new IllegalArgumentException("anchorProductId is required");

        Product anchor = productRepository.findById(anchorProductId)
                .orElseThrow(() -> new IllegalArgumentException("Anchor product not found: " + anchorProductId));

        List<Product> all = productRepository.findAll();

        String anchorCategory = safe(anchor.getCategory());

        // If the anchor defines an explicit bundle (seedKey list), use it verbatim (deterministic order).
        List<Product> explicit = resolveExplicitBundle(anchor, all);
        if (!explicit.isEmpty()) {
            return toDto(anchor, explicit);
        }

        // Deterministic selection: only ACCESSORY items whose compatibleWith includes anchor category (or ANY).
        List<Product> picked = all.stream()
                .filter(Objects::nonNull)
                .filter(p -> p.getProductId() != null && !Objects.equals(p.getProductId(), anchor.getProductId()))
                .filter(p -> "ACCESSORY".equalsIgnoreCase(safe(p.getBundleRole())))
                .filter(p -> isCompatibleWith(p.getCompatibleWith(), anchorCategory))
                .sorted(Comparator
                        .comparingInt((Product p) -> rankForAnchor(p, anchorCategory))
                        .thenComparing((Product p) -> p.getBasePrice() != null ? p.getBasePrice() : BigDecimal.ZERO, Comparator.reverseOrder())
                        .thenComparing(p -> safe(p.getName())))
                .limit(8)
                .toList();

        // Fallback: if none configured, allow ANY accessories.
        if (picked.isEmpty()) {
            picked = all.stream()
                    .filter(Objects::nonNull)
                    .filter(p -> p.getProductId() != null && !Objects.equals(p.getProductId(), anchor.getProductId()))
                    .filter(p -> "ACCESSORY".equalsIgnoreCase(safe(p.getBundleRole())))
                    .sorted(Comparator
                            .comparingInt((Product p) -> rankForAnchor(p, anchorCategory))
                            .thenComparing((Product p) -> p.getBasePrice() != null ? p.getBasePrice() : BigDecimal.ZERO, Comparator.reverseOrder())
                            .thenComparing(p -> safe(p.getName())))
                    .limit(8)
                    .toList();
        }

        return toDto(anchor, picked);
    }

    private CompleteSetupBundleDto toDto(Product anchor, List<Product> picked) {
        List<String> compatBadges = buildCompatBadges(anchor);

        List<CompleteSetupAccessoryDto> accessories = new ArrayList<>();
        int rank = 1;
        for (Product p : picked) {
            String accent = pickAccent(p.getTags(), p.getCategory(), rank);
            String why = buildWhyLine(anchor, p);
            String compat = buildAccessoryCompatBadge(anchor, p);
            BigDecimal oldPrice = inferOldPrice(p.getBasePrice(), rank);

            accessories.add(new CompleteSetupAccessoryDto(
                    p.getProductId(),
                    p.getName(),
                    p.getCategory(),
                    p.getBrand(),
                    p.getImageUrl(),
                    p.getBasePrice(),
                    oldPrice,
                    why,
                    compat,
                    rank,
                    accent
            ));
            rank++;
        }

        BigDecimal maxSave = accessories.stream()
                .map(CompleteSetupAccessoryDto::basePrice)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .multiply(BigDecimal.valueOf(0.15))
                .setScale(0, java.math.RoundingMode.HALF_UP);

        return new CompleteSetupBundleDto(
                anchor.getProductId(),
                anchor.getName(),
                anchor.getCategory(),
                anchor.getBrand(),
                anchor.getImageUrl(),
                anchor.getBasePrice(),
                compatBadges,
                maxSave,
                accessories
        );
    }

    private static String buildWhyLine(Product anchor, Product accessory) {
        String a = safe(anchor != null ? anchor.getCategory() : "");
        String b = safe(accessory != null ? accessory.getCategory() : "");
        if (!a.isBlank() && !b.isBlank() && !a.equalsIgnoreCase(b)) return "✦ Complements your " + a.toLowerCase() + " with a perfect add-on";
        return "✦ Frequently paired with similar buyers";
    }

    private static String buildAccessoryCompatBadge(Product anchor, Product accessory) {
        if (anchor == null || accessory == null) return "Compatible";
        String ac = safe(accessory.getCategory()).toLowerCase(Locale.ROOT);
        if (ac.contains("keyboard")) return "USB‑C · Wireless";
        if (ac.contains("mouse") || ac.contains("mice")) return "macOS Bluetooth";
        if (ac.contains("monitor")) return "Display ready";
        if (ac.contains("audio")) return "Low‑latency audio";
        if (ac.contains("mobility")) return "Travel essential";
        return "Setup compatible";
    }

    private static BigDecimal inferOldPrice(BigDecimal basePrice, int rank) {
        if (basePrice == null) return null;
        // only some items show a strike-through old price (like the preview)
        if (rank % 3 != 0) return null;
        return basePrice.multiply(BigDecimal.valueOf(1.18)).setScale(0, java.math.RoundingMode.HALF_UP);
    }

    private static List<String> buildCompatBadges(Product anchor) {
        List<String> badges = new ArrayList<>();

        String cat = safe(anchor != null ? anchor.getCategory() : "").toLowerCase(Locale.ROOT);
        if (!cat.isBlank()) {
            if (cat.contains("mobility")) badges.add("Travel ready");
            else if (cat.contains("audio")) badges.add("Audio optimized");
            else if (cat.contains("keyboard")) badges.add("Desk workflow fit");
            else badges.add("Setup compatible");
        }

        // surface one spec if present
        Map<String, String> spec = toSpecMap(anchor);
        String conn = firstNonBlank(spec.get("connection"), spec.get("connectivity"));
        if (conn != null) badges.add(conn);

        String compat = spec.get("compatibility");
        if (compat != null && !compat.isBlank()) badges.add(compat);

        // fall back to tags
        Set<String> tags = tokenize(anchor != null ? anchor.getTags() : null);
        if (badges.size() < 4 && tags.contains("minimalist")) badges.add("Minimalist fit");
        if (badges.size() < 4 && tags.contains("wireless")) badges.add("Wireless ready");
        if (badges.size() < 4 && tags.contains("ergonomic")) badges.add("Ergonomic");

        // ensure 4 max
        return badges.stream().filter(s -> s != null && !s.isBlank()).distinct().limit(4).toList();
    }

    private static Map<String, String> toSpecMap(Product p) {
        if (p == null || p.getSpecifications() == null) return Map.of();
        Map<String, String> out = new HashMap<>();
        for (ProductSpecification s : p.getSpecifications()) {
            if (s == null || s.getKey() == null) continue;
            out.put(s.getKey(), safe(s.getValue()));
        }
        return out;
    }

    private static String pickAccent(String tags, String category, int rank) {
        // Use a small palette to mimic the preview’s “colored” cards without persisting UI-only state.
        String t = (tags == null ? "" : tags).toLowerCase(Locale.ROOT);
        String c = (category == null ? "" : category).toLowerCase(Locale.ROOT);
        if (c.contains("audio")) return "amber";
        if (c.contains("monitor")) return "teal";
        if (c.contains("mobility")) return "green";
        if (t.contains("zen")) return "blue";
        if (rank % 4 == 1) return "purple";
        if (rank % 4 == 2) return "amber";
        if (rank % 4 == 3) return "teal";
        return "blue";
    }

    private static Set<String> tokenize(String raw) {
        if (raw == null || raw.isBlank()) return Set.of();
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(s -> s.toLowerCase(Locale.ROOT))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static boolean isCompatibleWith(String compatibleWith, String anchorCategory) {
        String a = safe(anchorCategory).toLowerCase(Locale.ROOT);
        if (a.isBlank()) return false;
        Set<String> cw = tokenize(compatibleWith);
        return cw.contains("any") || cw.contains(a);
    }

    private static int rankForAnchor(Product p, String anchorCategory) {
        if (p == null) return Integer.MAX_VALUE;
        // 1) If JSON map exists, try to pick exact anchor category, else ANY.
        String json = safe(p.getBundleRankByAnchor());
        if (!json.isBlank()) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> m = new com.fasterxml.jackson.databind.ObjectMapper().readValue(json, Map.class);
                String a = safe(anchorCategory);
                Object v = m.get(a);
                if (v == null) v = m.get(a.toLowerCase(Locale.ROOT));
                if (v == null) v = m.get("ANY");
                if (v == null) v = m.get("any");
                if (v instanceof Number n) return n.intValue();
                if (v != null) return Integer.parseInt(v.toString().trim());
            } catch (Exception ignore) {
            }
        }
        // 2) fallback to single rank
        Integer r = p.getBundleRank();
        return r != null ? r : 9999;
    }

    private static List<Product> resolveExplicitBundle(Product anchor, List<Product> all) {
        if (anchor == null) return List.of();
        Set<String> wanted = tokenize(anchor.getBundleIncludes());
        if (wanted.isEmpty()) return List.of();

        // Keep order as listed in bundleIncludes
        List<String> order = Arrays.stream(safe(anchor.getBundleIncludes()).split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .toList();

        Map<String, Product> byKey = new HashMap<>();
        for (Product p : all) {
            if (p == null || p.getProductId() == null) continue;
            String k = safe(p.getSeedKey());
            if (!k.isBlank()) byKey.put(k.toLowerCase(Locale.ROOT), p);
        }

        List<Product> out = new ArrayList<>();
        for (String k0 : order) {
            String k = k0.toLowerCase(Locale.ROOT);
            Product p = byKey.get(k);
            if (p == null) continue;
            if (Objects.equals(p.getProductId(), anchor.getProductId())) continue;
            if (!"ACCESSORY".equalsIgnoreCase(safe(p.getBundleRole()))) continue;
            out.add(p);
        }
        return out.stream().distinct().limit(8).toList();
    }

    private static String safe(String s) {
        return s == null ? "" : s.trim();
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        if (b != null && !b.isBlank()) return b;
        return null;
    }

}

