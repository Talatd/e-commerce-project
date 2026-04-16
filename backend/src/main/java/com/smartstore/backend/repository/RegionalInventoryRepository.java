package com.smartstore.backend.repository;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.RegionalInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegionalInventoryRepository extends JpaRepository<RegionalInventory, Long> {
    List<RegionalInventory> findByProduct(Product product);
    Optional<RegionalInventory> findByProductAndRegion(Product product, String region);
}
