package com.smartstore.backend.controller;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.OrderItem;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.Role;
import com.smartstore.backend.model.User;
import com.smartstore.backend.model.Coupon;
import com.smartstore.backend.repository.CouponRepository;
import com.smartstore.backend.repository.OrderRepository;
import com.smartstore.backend.repository.ProductRepository;
import com.smartstore.backend.repository.UserRepository;
import com.smartstore.backend.service.MailService;
import com.smartstore.backend.ws.StockBroadcastService;
import com.smartstore.backend.ws.StockEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.math.BigDecimal;
import java.math.RoundingMode;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final CouponRepository couponRepository;
    private final StockBroadcastService stockBroadcastService;
    private final com.smartstore.backend.service.LowStockAlertService lowStockAlertService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all orders (admin)", description = "Returns every order in the system. Admin only.")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll());
    }

    @GetMapping("/my")
    @Operation(summary = "List orders for the current user")
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        // Return a detailed view (items + products) so the SPA can render order details.
        return ResponseEntity.ok(orderRepository.findByUserIdWithItemsAndProducts(user.getUserId()));
    }

    @GetMapping("/my-store")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "List orders for the manager's store", description = "Returns orders that include products belonging to the current manager's store.")
    public ResponseEntity<List<Order>> getMyStoreOrders(@AuthenticationPrincipal UserDetails principal) {
        var user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(orderRepository.findStoreOrdersByOwnerId(user.getUserId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Order owner or admin only.")
    public ResponseEntity<Order> getOrder(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails principal) {
        Optional<Order> found = orderRepository.findDetailedById(Objects.requireNonNull(id));
        if (found.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Order order = found.get();
        User current = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        if (current.getRole() != Role.ADMIN
                && !order.getUser().getUserId().equals(current.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel my order", description = "Order owner can cancel when not shipped/delivered.")
    public ResponseEntity<Order> cancelMyOrder(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails principal) {
        User current = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Order order = orderRepository.findDetailedById(Objects.requireNonNull(id)).orElseThrow();
        if (current.getRole() != Role.ADMIN && !order.getUser().getUserId().equals(current.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (order.getStatus() == Order.OrderStatus.CANCELLED || order.getStatus() == Order.OrderStatus.RETURNED) {
            return ResponseEntity.ok(order);
        }
        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Restock items
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product == null || product.getProductId() == null) continue;
                Product db = productRepository.findById(Objects.requireNonNull(product.getProductId())).orElse(null);
                if (db == null) continue;
                int stock = db.getStockQuantity() != null ? db.getStockQuantity() : 0;
                int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                int newStock = stock + Math.max(0, qty);
                db.setStockQuantity(newStock);
                productRepository.save(db);
                stockBroadcastService.publish(new StockEvent(
                        db.getProductId(),
                        newStock,
                        Math.max(0, qty),
                        "cancel",
                        current.getEmail(),
                        System.currentTimeMillis()
                ));
            }
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PatchMapping("/{id}/return")
    @Operation(summary = "Return my order", description = "Order owner can request return after delivery.")
    public ResponseEntity<Order> returnMyOrder(@PathVariable Long id,
                                               @AuthenticationPrincipal UserDetails principal) {
        User current = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        Order order = orderRepository.findDetailedById(Objects.requireNonNull(id)).orElseThrow();
        if (current.getRole() != Role.ADMIN && !order.getUser().getUserId().equals(current.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (order.getStatus() == Order.OrderStatus.RETURNED) {
            return ResponseEntity.ok(order);
        }
        if (order.getStatus() != Order.OrderStatus.DELIVERED) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Restock items (simple policy for this MVP)
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product == null || product.getProductId() == null) continue;
                Product db = productRepository.findById(Objects.requireNonNull(product.getProductId())).orElse(null);
                if (db == null) continue;
                int stock = db.getStockQuantity() != null ? db.getStockQuantity() : 0;
                int qty = item.getQuantity() != null ? item.getQuantity() : 0;
                int newStock = stock + Math.max(0, qty);
                db.setStockQuantity(newStock);
                productRepository.save(db);
                stockBroadcastService.publish(new StockEvent(
                        db.getProductId(),
                        newStock,
                        Math.max(0, qty),
                        "return",
                        current.getEmail(),
                        System.currentTimeMillis()
                ));
            }
        }

        order.setStatus(Order.OrderStatus.RETURNED);
        return ResponseEntity.ok(orderRepository.save(order));
    }

    @PostMapping
    @Operation(summary = "Create a new order", description = "Creates an order for the authenticated user and decrements product stock.")
    public ResponseEntity<Order> createOrder(@RequestBody Order order,
                                             @AuthenticationPrincipal UserDetails principal) {
        User buyer = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        order.setUser(buyer);

        BigDecimal subtotal = BigDecimal.ZERO;
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                if (item.getQuantity() == null || item.getQuantity() <= 0) {
                    throw new IllegalArgumentException("Item quantity must be at least 1");
                }
                if (item.getProduct() == null || item.getProduct().getProductId() == null) {
                    throw new IllegalArgumentException("Each order item must include a productId");
                }
                Product product = productRepository.findById(
                        Objects.requireNonNull(item.getProduct().getProductId())).orElseThrow();
                int stock = product.getStockQuantity() != null ? product.getStockQuantity() : 0;
                if (stock < item.getQuantity()) {
                    throw new IllegalArgumentException(
                            "Insufficient stock for " + product.getName()
                                    + " (available: " + product.getStockQuantity()
                                    + ", requested: " + item.getQuantity() + ")");
                }
                int newStock = stock - item.getQuantity();
                product.setStockQuantity(newStock);
                productRepository.save(product);
                stockBroadcastService.publish(new StockEvent(
                        product.getProductId(),
                        newStock,
                        -item.getQuantity(),
                        "order",
                        buyer.getEmail(),
                        System.currentTimeMillis()
                ));
                lowStockAlertService.maybeAlert(product, buyer.getEmail());
                if (item.getPriceAtPurchase() == null) {
                    item.setPriceAtPurchase(product.getBasePrice());
                }
                item.setOrder(order);
                item.setProduct(product);

                BigDecimal line = item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()));
                subtotal = subtotal.add(line);
            }
        }

        // Normalize & apply coupon server-side (optional)
        String rawCode = order.getCouponCode() == null ? null : order.getCouponCode().trim();
        Coupon coupon = null;
        if (rawCode != null && !rawCode.isEmpty()) {
            coupon = couponRepository.findByCodeIgnoreCase(rawCode).orElse(null);
            if (coupon == null || coupon.getActive() == null || !coupon.getActive()) {
                throw new IllegalArgumentException("Invalid coupon code");
            }
            if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
                throw new IllegalArgumentException("Coupon expired");
            }
            order.setCouponCode(coupon.getCode().toUpperCase());
        } else {
            order.setCouponCode(null);
        }

        int pct = (coupon == null || coupon.getPercentOff() == null) ? 0 : Math.max(0, Math.min(100, coupon.getPercentOff()));
        BigDecimal discount = subtotal.multiply(BigDecimal.valueOf(pct)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal shipping = order.getShippingAmount() == null ? BigDecimal.ZERO : order.getShippingAmount().max(BigDecimal.ZERO);
        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = order.getTaxAmount();
        if (tax == null) {
            tax = taxable.multiply(BigDecimal.valueOf(0.08)).setScale(2, RoundingMode.HALF_UP);
        } else {
            tax = tax.max(BigDecimal.ZERO);
        }

        order.setSubtotalAmount(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setDiscountAmount(discount);
        order.setShippingAmount(shipping.setScale(2, RoundingMode.HALF_UP));
        order.setTaxAmount(tax);
        order.setTotalAmount(taxable.add(shipping).add(tax).setScale(2, RoundingMode.HALF_UP));

        Order saved = orderRepository.save(order);
        orderRepository.findDetailedById(saved.getOrderId()).ifPresent(o ->
                mailService.sendOrderConfirmation(buyer.getEmail(), o));
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Update order status", description = "Admin or store manager.")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Order order = orderRepository.findById(Objects.requireNonNull(id)).orElseThrow();
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        order.setStatus(Order.OrderStatus.valueOf(newStatus.toUpperCase()));
        return ResponseEntity.ok(orderRepository.save(order));
    }
}
