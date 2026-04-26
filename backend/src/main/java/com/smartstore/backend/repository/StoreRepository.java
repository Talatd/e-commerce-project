package com.smartstore.backend.repository;

import com.smartstore.backend.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    java.util.Optional<Store> findByName(String name);
    java.util.Optional<Store> findByOwnerId(Long ownerId);
    java.util.Optional<Store> findByOwnerName(String ownerName);

    @Query("""
            SELECT new com.smartstore.backend.dto.StoreAdminView(
                s.id,
                s.name,
                s.ownerName,
                s.ownerId,
                s.rating,
                s.status,
                COALESCE(SUM(i.priceAtPurchase * i.quantity), 0),
                COUNT(DISTINCT o.orderId)
            )
            FROM Store s
            LEFT JOIN com.smartstore.backend.model.Product p ON p.store = s
            LEFT JOIN com.smartstore.backend.model.OrderItem i ON i.product = p
            LEFT JOIN i.order o
            GROUP BY s.id, s.name, s.ownerName, s.ownerId, s.rating, s.status
            """)
    java.util.List<com.smartstore.backend.dto.StoreAdminView> findAllAdminViews();
}
