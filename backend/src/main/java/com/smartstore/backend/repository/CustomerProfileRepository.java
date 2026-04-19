package com.smartstore.backend.repository;

import com.smartstore.backend.model.CustomerProfile;
import com.smartstore.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Long> {
    Optional<CustomerProfile> findByUser(User user);
}
