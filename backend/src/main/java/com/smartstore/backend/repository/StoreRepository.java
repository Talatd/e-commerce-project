package com.smartstore.backend.repository;

import com.smartstore.backend.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    java.util.Optional<Store> findByName(String name);
}
