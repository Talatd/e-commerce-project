package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SuppressWarnings("all")
class OrderControllerTest {

    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @InjectMocks private OrderController controller;

    @BeforeEach
    void setUp() { MockitoAnnotations.openMocks(this); }

    @Test
    void getAllOrders_ReturnsAll() {
        Order o1 = new Order(); o1.setOrderId(1L);
        Order o2 = new Order(); o2.setOrderId(2L);
        when(orderRepository.findAll()).thenReturn(List.of(o1, o2));

        ResponseEntity<List<Order>> response = controller.getAllOrders();

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void getOrder_Exists_ReturnsOrder() {
        Order o = new Order();
        o.setOrderId(1L);
        o.setTotalAmount(BigDecimal.valueOf(250));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));

        ResponseEntity<Order> response = controller.getOrder(1L);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(BigDecimal.valueOf(250), response.getBody().getTotalAmount());
    }

    @Test
    void getOrder_NotFound_Returns404() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());
        ResponseEntity<Order> response = controller.getOrder(99L);
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void updateStatus_UpdatesAndReturns() {
        Order o = new Order();
        o.setOrderId(1L);
        o.setStatus(Order.OrderStatus.PENDING);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));
        when(orderRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<Order> response = controller.updateStatus(1L, Map.of("status", "SHIPPED"));

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(Order.OrderStatus.SHIPPED, response.getBody().getStatus());
    }
}
