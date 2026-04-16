package com.smartstore.backend.repository;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProduct(Product product);
}
