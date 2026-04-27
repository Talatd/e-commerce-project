package com.smartstore.backend.controller;

import com.smartstore.backend.model.Product;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.ProductReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@SuppressWarnings("all")
class ProductControllerTest {

    @Mock private ProductRepository productRepository;
    @Mock private ProductReviewRepository reviewRepository;
    @Mock private com.smartstore.backend.repository.UserRepository userRepository;
    @Mock private com.smartstore.backend.repository.StoreRepository storeRepository;
    @InjectMocks private ProductController controller;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllProducts_WithSearch_ReturnsFilteredPage() {
        Product p = new Product();
        p.setProductId(1L);
        p.setName("Laptop");
        p.setBasePrice(BigDecimal.valueOf(999));
        var page = new PageImpl<>(List.of(p));
        when(productRepository.findByNameContainingIgnoreCase(eq("Laptop"), any(Pageable.class))).thenReturn(page);

        ResponseEntity<?> response = controller.getAllProducts("Laptop", null, null, 0, 50);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
    }

    @Test
    void getProduct_Exists_ReturnsProduct() {
        Product p = new Product();
        p.setProductId(5L);
        p.setName("Phone");
        when(productRepository.findById(5L)).thenReturn(Optional.of(p));

        ResponseEntity<Product> response = controller.getProduct(5L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Phone", response.getBody().getName());
    }

    @Test
    void getProduct_NotFound_Returns404() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        ResponseEntity<Product> response = controller.getProduct(99L);
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void createProduct_SavesAndReturns() {
        Product p = new Product();
        p.setName("New Product");
        com.smartstore.backend.model.Store store = com.smartstore.backend.model.Store.builder().id(1L).name("S").ownerId(1L).build();
        p.setStore(store);
        when(productRepository.save(any())).thenReturn(p);
        when(storeRepository.findById(1L)).thenReturn(java.util.Optional.of(store));

        org.springframework.security.core.userdetails.UserDetails principal =
                org.springframework.security.core.userdetails.User.withUsername("admin@nexus.io")
                        .password("")
                        .roles("ADMIN")
                        .build();
        com.smartstore.backend.model.User admin = com.smartstore.backend.model.User.builder()
                .userId(1L)
                .email("admin@nexus.io")
                .fullName("Admin")
                .passwordHash("x")
                .role(com.smartstore.backend.model.Role.ADMIN)
                .enabled(true)
                .build();
        when(userRepository.findByEmail("admin@nexus.io")).thenReturn(java.util.Optional.of(admin));

        ResponseEntity<Product> response = controller.createProduct(p, principal);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("New Product", response.getBody().getName());
        verify(productRepository).save(any());
    }

    @Test
    void deleteProduct_CallsRepository() {
        Product p = new Product();
        p.setProductId(10L);
        com.smartstore.backend.model.Store store = com.smartstore.backend.model.Store.builder().id(1L).name("S").ownerId(1L).build();
        p.setStore(store);
        when(productRepository.findById(10L)).thenReturn(java.util.Optional.of(p));
        doNothing().when(productRepository).deleteById(10L);

        org.springframework.security.core.userdetails.UserDetails principal =
                org.springframework.security.core.userdetails.User.withUsername("admin@nexus.io")
                        .password("")
                        .roles("ADMIN")
                        .build();
        com.smartstore.backend.model.User admin = com.smartstore.backend.model.User.builder()
                .userId(1L)
                .email("admin@nexus.io")
                .fullName("Admin")
                .passwordHash("x")
                .role(com.smartstore.backend.model.Role.ADMIN)
                .enabled(true)
                .build();
        when(userRepository.findByEmail("admin@nexus.io")).thenReturn(java.util.Optional.of(admin));

        ResponseEntity<Void> response = controller.deleteProduct(10L, principal);
        assertEquals(200, response.getStatusCode().value());
        verify(productRepository).deleteById(10L);
    }
}
