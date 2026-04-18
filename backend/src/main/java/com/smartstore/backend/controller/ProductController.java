package com.smartstore.backend.controller;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductReview;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.ProductReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Endpoints for catalog browsing and sentiment analysis")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;
    private final com.smartstore.backend.repository.UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieves the full product catalog from the database.")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieves specific product details.")
    public ResponseEntity<Product> getProduct(@PathVariable @org.springframework.lang.NonNull Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/reviews/sentiment")
    @Operation(summary = "Analyze product sentiment", description = "Calculates average sentiment score from reviews using AI enriched data.")
    public ResponseEntity<Map<String, Object>> getProductSentiment(@PathVariable @org.springframework.lang.NonNull Long id) {
        Product product = productRepository.findById(id).orElseThrow();
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
            @PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody Map<String, Object> payload) {
        
        Product product = productRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        Long userIdRaw = Long.valueOf(payload.get("userId").toString());
        com.smartstore.backend.model.User user = userRepository.findById(java.util.Objects.requireNonNull(userIdRaw)).orElseThrow();
        
        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setUser(user);
        review.setRating((Integer) payload.get("rating"));
        review.setComment((String) payload.get("comment"));
        
        // Mock sentiment analysis for now - in real life this would call the AI hub
        double mockSentiment = review.getRating() >= 4 ? 0.9 : (review.getRating() <= 2 ? 0.2 : 0.5);
        review.setSentimentScore(BigDecimal.valueOf(mockSentiment));
        
        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
