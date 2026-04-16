package com.smartstore.backend.controller;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductReview;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/reviews/sentiment")
    public ResponseEntity<Map<String, Object>> getProductSentiment(@PathVariable Long id) {
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
}
