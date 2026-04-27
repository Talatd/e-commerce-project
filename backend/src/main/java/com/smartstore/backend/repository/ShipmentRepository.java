package com.smartstore.backend.repository;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.Shipment;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrder(Order order);
    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    @Query("""
            SELECT DISTINCT sh
            FROM Shipment sh
            JOIN sh.order o
            LEFT JOIN o.items i
            LEFT JOIN i.product p
            LEFT JOIN p.store s
            WHERE s.id = :storeId
            ORDER BY o.orderDate DESC
            """)
    List<Shipment> findByStoreId(@Param("storeId") Long storeId);
}
