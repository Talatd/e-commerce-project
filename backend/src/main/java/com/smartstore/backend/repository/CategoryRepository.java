package com.smartstore.backend.repository;

import com.smartstore.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findByParentIsNullOrderByDisplayOrder();
    List<Category> findByParentOrderByDisplayOrder(Category parent);
    boolean existsByName(String name);
}
