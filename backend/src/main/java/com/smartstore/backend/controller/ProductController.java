package com.smartstore.backend.controller;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductReview;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.ProductReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for catalog browsing and sentiment analysis")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;
    private final com.smartstore.backend.repository.UserRepository userRepository;
    private final com.smartstore.backend.repository.StoreRepository storeRepository;
    private final com.smartstore.backend.service.DbInitializer dbInitializer;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieves the product catalog, optionally paginated.")
    public ResponseEntity<?> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long storeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (page > 0 || size != 50 || search != null || category != null || storeId != null) {
            org.springframework.data.domain.Pageable pageable =
                    org.springframework.data.domain.PageRequest.of(page, size,
                            org.springframework.data.domain.Sort.by("createdAt").descending());
            if (search != null && !search.isBlank()) {
                return ResponseEntity.ok(productRepository.findByNameContainingIgnoreCase(search, pageable));
            }
            if (category != null && !category.isBlank()) {
                return ResponseEntity.ok(productRepository.findByCategory(category, pageable));
            }
            if (storeId != null) {
                return ResponseEntity.ok(productRepository.findByStore_Id(storeId, pageable));
            }
            return ResponseEntity.ok(productRepository.findAll(pageable));
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> getMyStoreProducts(@AuthenticationPrincipal UserDetails principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        com.smartstore.backend.model.User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        
        // Find store where ownerName matches user's full name (simple mapping for this MVP)
        return storeRepository.findByName(user.getFullName().contains("Marcus") ? "TechHub Performance" : "GadgetPro Lifestyle")
            .map(store -> ResponseEntity.ok(productRepository.findByStore_Id(store.getId(), org.springframework.data.domain.Pageable.unpaged()).getContent()))
            .orElse(ResponseEntity.ok(List.of()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves specific product details.")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get product reviews", description = "Lists all reviews for a given product.")
    public ResponseEntity<List<ProductReview>> getProductReviews(@PathVariable Long id) {
        Product product = productRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        return ResponseEntity.ok(reviewRepository.findByProduct(product));
    }

    @GetMapping("/{id}/reviews/sentiment")
    @Operation(summary = "Analyze product sentiment", description = "Calculates average sentiment score from reviews using AI enriched data.")
    public ResponseEntity<Map<String, Object>> getProductSentiment(@PathVariable Long id) {
        Product product = productRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        List<ProductReview> reviews = reviewRepository.findByProduct(product);
        
        double averageSentiment = reviews.stream()
                .map(r -> r.getSentimentScore())
                .filter(s -> s != null)
                .mapToDouble(BigDecimal::doubleValue)
                .average()
                .orElse(0.5);

        String sentimentLabel = averageSentiment > 0.6 ? "POSITIVE" : (averageSentiment < 0.4 ? "NEGATIVE" : "NEUTRAL");

        return ResponseEntity.ok(Map.of(
            "productName", product.getName(),
            "averageScore", averageSentiment,
            "sentimentLabel", sentimentLabel,
            "reviewCount", reviews.size()
        ));
    }

    @PostMapping("/{id}/reviews")
    @Operation(summary = "Submit a product review", description = "Allows a consumer to post a rating and comment for a product.")
    public ResponseEntity<ProductReview> submitReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails principal) {

        Product product = productRepository.findById(Objects.requireNonNull(id)).orElseThrow();

        if (principal == null) {
            throw new IllegalArgumentException("Authentication required to submit a review");
        }
        com.smartstore.backend.model.User user =
                userRepository.findByEmail(principal.getUsername()).orElseThrow();

        int rating = parseRating(payload);
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(Integer.valueOf(rating));
        review.setComment((String) payload.get("comment"));

        double mockSentiment = review.getRating() >= 4 ? 0.9 : (review.getRating() <= 2 ? 0.2 : 0.5);
        review.setSentimentScore(BigDecimal.valueOf(mockSentiment));

        ProductReview saved = reviewRepository.save(review);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/reviews/{reviewId}/respond")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Respond to a review", description = "Store owner responds to a customer review.")
    public ResponseEntity<ProductReview> respondToReview(
            @PathVariable Long reviewId,
            @RequestBody Map<String, String> body) {
        ProductReview review = reviewRepository.findById(Objects.requireNonNull(reviewId)).orElseThrow();
        review.setStoreResponse(body.get("response"));
        review.setRespondedAt(java.time.LocalDateTime.now());
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @GetMapping("/reviews/all")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Get all reviews", description = "Returns all product reviews for management.")
    public ResponseEntity<java.util.List<ProductReview>> getAllReviews() {
        return ResponseEntity.ok(reviewRepository.findAll());
    }

    @PostMapping("/seed-reviews-dev")
    @Operation(summary = "Reseed reviews", description = "Clears and regenerates diverse reviews for all products. Used for dev/demo purposes.")
    public ResponseEntity<String> reseedReviewsDev() {
        dbInitializer.reseedReviews();
        return ResponseEntity.ok("Reviews successfully reseeded with diverse sentiments.");
    }

    @GetMapping("/reviews/count-dev")
    public ResponseEntity<Long> getReviewCountDev() {
        return ResponseEntity.ok(reviewRepository.count());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Add a new product", description = "Creates a new electronics product in the catalog.")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productRepository.save(Objects.requireNonNull(product)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update product", description = "Updates an existing product's details and stock.")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setBasePrice(productDetails.getBasePrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setCategory(productDetails.getCategory());
        product.setImageUrl(productDetails.getImageUrl());
        Product saved = productRepository.save(Objects.requireNonNull(product));
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Delete product", description = "Removes a product from the catalog.")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    private static int parseRating(Map<String, Object> payload) {
        Object raw = payload.get("rating");
        if (raw == null) {
            throw new IllegalArgumentException("Rating is required");
        }
        if (raw instanceof Number n) {
            return n.intValue();
        }
        return Integer.parseInt(raw.toString().trim());
    }
}
