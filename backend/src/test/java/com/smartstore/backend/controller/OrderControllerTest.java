package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.Role;
import com.smartstore.backend.model.User;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.UserRepository;
import com.smartstore.backend.service.MailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

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
    @Mock private UserRepository userRepository;
    @Mock private MailService mailService;
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
        User buyer = new User();
        buyer.setUserId(1L);
        buyer.setEmail("owner@test.com");
        buyer.setRole(Role.CONSUMER);

        Order o = new Order();
        o.setOrderId(1L);
        o.setTotalAmount(BigDecimal.valueOf(250));
        o.setUser(buyer);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));
        when(userRepository.findByEmail("owner@test.com")).thenReturn(Optional.of(buyer));

        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("owner@test.com")
                .password("")
                .roles("CONSUMER")
                .build();

        ResponseEntity<Order> response = controller.getOrder(1L, principal);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(BigDecimal.valueOf(250), response.getBody().getTotalAmount());
    }

    @Test
    void getOrder_NotFound_Returns404() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("any@test.com")
                .password("")
                .roles("CONSUMER")
                .build();
        ResponseEntity<Order> response = controller.getOrder(99L, principal);
        assertEquals(404, response.getStatusCode().value());
    }

    @Test
    void getOrder_NotOwner_Returns403() {
        User owner = new User();
        owner.setUserId(1L);
        owner.setEmail("owner@test.com");
        owner.setRole(Role.CONSUMER);

        User other = new User();
        other.setUserId(2L);
        other.setEmail("other@test.com");
        other.setRole(Role.CONSUMER);

        Order o = new Order();
        o.setOrderId(1L);
        o.setUser(owner);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(o));
        when(userRepository.findByEmail("other@test.com")).thenReturn(Optional.of(other));

        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername("other@test.com")
                .password("")
                .roles("CONSUMER")
                .build();

        ResponseEntity<Order> response = controller.getOrder(1L, principal);
        assertEquals(403, response.getStatusCode().value());
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
