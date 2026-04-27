package com.smartstore.backend.repository;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.ProductReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProduct(Product product);

    @Query("""
            SELECT r
            FROM ProductReview r
            JOIN r.product p
            JOIN p.store s
            WHERE s.id = :storeId
            ORDER BY r.createdAt DESC
            """)
    List<ProductReview> findByStoreId(@Param("storeId") Long storeId);
}
