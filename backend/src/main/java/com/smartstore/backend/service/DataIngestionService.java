package com.smartstore.backend.service;

import com.smartstore.backend.model.*;
import com.smartstore.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataIngestionService {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RegionalInventoryRepository inventoryRepository;

    @Transactional
    public void importProductsFromDS4(InputStream inputStream) throws Exception {
        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream), 
                CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {
            List<Product> products = new ArrayList<>();
            
            for (CSVRecord record : parser) {
                Product product = new Product();
                product.setName(record.get("product_name"));
                product.setCategory(record.get("category"));
                product.setBrand(record.get("brand"));
                product.setBasePrice(new BigDecimal(record.get("price")));
                product.setDescription(record.get("description"));
                products.add(product);
            }
            productRepository.saveAll(products);
        }
    }

    @Transactional
    public void importReviewsFromDS6(InputStream inputStream) throws Exception {
        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream), 
                CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {
            User dummyUser = userRepository.findAll().stream().findFirst().orElse(null);
            
            for (CSVRecord record : parser) {
                Long productId = Long.parseLong(record.get("product_id"));
                Product product = productRepository.findById(productId).orElse(null);
                
                if (product != null && dummyUser != null) {
                    ProductReview review = new ProductReview();
                    review.setProduct(product);
                    review.setUser(dummyUser);
                    review.setRating(Integer.parseInt(record.get("star_rating")));
                    review.setComment(record.get("review_body"));
                    // Sentiment default to neutral for now, will be set by Python AI later
                    review.setSentimentScore(BigDecimal.valueOf(0.5)); 
                    reviewRepository.save(review);
                }
            }
        }
    }

    @Transactional
    public void importInventoryFromDS5(InputStream inputStream) throws Exception {
        try (CSVParser parser = new CSVParser(new InputStreamReader(inputStream), 
                CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build())) {
            for (CSVRecord record : parser) {
                Long productId = Long.parseLong(record.get("product_id"));
                Product product = productRepository.findById(productId).orElse(null);
                
                if (product != null) {
                    RegionalInventory inventory = new RegionalInventory();
                    inventory.setProduct(product);
                    inventory.setRegion(record.get("region"));
                    inventory.setStockQuantity(Integer.parseInt(record.get("stock")));
                    inventoryRepository.save(inventory);
                }
            }
        }
    }
}
