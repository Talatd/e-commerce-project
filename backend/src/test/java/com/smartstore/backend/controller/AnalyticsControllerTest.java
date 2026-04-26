package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.Store;
import com.smartstore.backend.dto.StoreAdminView;
import com.smartstore.backend.repository.CustomerProfileRepository;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.StoreRepository;
import com.smartstore.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@SuppressWarnings("all")
class AnalyticsControllerTest {

    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private StoreRepository storeRepository;
    @Mock private CustomerProfileRepository profileRepository;
    @InjectMocks private AnalyticsController controller;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAdminStats_ReturnsCounts() {
        when(orderRepository.count()).thenReturn(50L);
        when(userRepository.count()).thenReturn(120L);
        when(storeRepository.count()).thenReturn(5L);

        Order o = new Order();
        o.setTotalAmount(BigDecimal.valueOf(500));
        when(orderRepository.findAll()).thenReturn(List.of(o));

        ResponseEntity<Map<String, Object>> response = controller.getAdminStats();

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> stats = response.getBody();
        assertNotNull(stats);
        assertEquals(50L, stats.get("totalOrders"));
        assertEquals(120L, stats.get("totalUsers"));
        assertEquals(5L, stats.get("totalStores"));
    }

    @Test
    void getSalesBreakdown_ReturnsData() {
        ResponseEntity<Map<String, Object>> response = controller.getSalesBreakdown();

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertTrue(body.containsKey("categories"));
        assertTrue(body.containsKey("regions"));
    }

    @Test
    void getStoreComparison_ReturnsSortedStores() {
        StoreAdminView s1 = new StoreAdminView(
                1L, "Alpha", "Owner1",
                11L, 4.5, "OPEN",
                java.math.BigDecimal.valueOf(5000.0), 20L
        );
        StoreAdminView s2 = new StoreAdminView(
                2L, "Beta", "Owner2",
                22L, 4.2, "OPEN",
                java.math.BigDecimal.valueOf(8000.0), 30L
        );
        when(storeRepository.findAllAdminViews()).thenReturn(List.of(s1, s2));

        ResponseEntity<List<Map<String, Object>>> response = controller.getStoreComparison();

        assertEquals(200, response.getStatusCode().value());
        List<Map<String, Object>> result = response.getBody();
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Beta", result.get(0).get("name"));
    }

    @Test
    void getCustomerSegments_EmptyProfiles_ReturnsDefaults() {
        when(profileRepository.findAll()).thenReturn(List.of());

        ResponseEntity<Map<String, Object>> response = controller.getCustomerSegments();

        assertEquals(200, response.getStatusCode().value());
        Map<String, Object> body = response.getBody();
        assertNotNull(body);
        assertEquals(0, body.get("totalCustomers"));
        assertEquals(0L, body.get("avgSpend"));
    }
}
