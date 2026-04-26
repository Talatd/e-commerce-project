package com.smartstore.backend.controller;

import com.smartstore.backend.model.Category;
import com.smartstore.backend.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping({"/api/v1/categories", "/api/categories"})
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Product category management")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    @Operation(summary = "List all categories")
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/tree")
    @Operation(summary = "Get top-level categories (for hierarchy)")
    public ResponseEntity<List<Category>> getTree() {
        return ResponseEntity.ok(categoryRepository.findByParentIsNullOrderByDisplayOrder());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        return categoryRepository.findById(Objects.requireNonNull(id))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a category")
    public ResponseEntity<Category> create(@RequestBody Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new IllegalStateException("Category '" + category.getName() + "' already exists");
        }
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a category")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category details) {
        Category cat = categoryRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        cat.setName(details.getName());
        cat.setDescription(details.getDescription());
        cat.setImageUrl(details.getImageUrl());
        cat.setDisplayOrder(details.getDisplayOrder());
        cat.setActive(details.getActive());
        if (details.getParent() != null) {
            cat.setParent(details.getParent());
        }
        return ResponseEntity.ok(categoryRepository.save(cat));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }
}
