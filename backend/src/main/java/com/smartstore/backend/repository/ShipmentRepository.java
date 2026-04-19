package com.smartstore.backend.repository;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrder(Order order);
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}
