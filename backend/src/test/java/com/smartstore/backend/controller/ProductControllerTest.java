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

        ResponseEntity<?> response = controller.getAllProducts("Laptop", null, 0, 50);

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
    void getProduct_NotFound_Throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(Exception.class, () -> controller.getProduct(99L));
    }

    @Test
    void createProduct_SavesAndReturns() {
        Product p = new Product();
        p.setName("New Product");
        when(productRepository.save(any())).thenReturn(p);

        ResponseEntity<Product> response = controller.createProduct(p);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("New Product", response.getBody().getName());
        verify(productRepository).save(any());
    }

    @Test
    void deleteProduct_CallsRepository() {
        doNothing().when(productRepository).deleteById(10L);
        ResponseEntity<Void> response = controller.deleteProduct(10L);
        assertEquals(200, response.getStatusCode().value());
        verify(productRepository).deleteById(10L);
    }
}
