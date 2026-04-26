package com.smartstore.backend.service;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.OrderItem;
import com.smartstore.backend.model.Product;
import com.smartstore.backend.model.Shipment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Slf4j
@Service
public class MailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@localhost}")
    private String fromAddress;

    @Value("${app.mail.frontend-base-url:http://localhost:4200}")
    private String frontendBaseUrl;

    private boolean mailEnabled() {
        return mailSender != null;
    }

    public void sendPasswordReset(String toEmail, String rawToken) {
        String link = frontendBaseUrl.replaceAll("/$", "") + "/reset-password?token=" + rawToken;
        String body = "Hello,\n\n"
                + "We received a request to reset your Nexus account password.\n"
                + "Open this link to choose a new password (valid for 1 hour):\n\n"
                + link + "\n\n"
                + "If you did not request this, you can ignore this email.\n";
        sendPlain(toEmail, "Reset your Nexus password", body);
    }

    public void sendOrderConfirmation(String toEmail, Order order) {
        String items = order.getItems() == null ? ""
                : order.getItems().stream()
                .map(this::itemLine)
                .collect(Collectors.joining("\n"));
        BigDecimal total = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
        String body = "Hello,\n\n"
                + "Thank you for your order.\n\n"
                + "Order #" + order.getOrderId() + "\n"
                + "Total: " + total + "\n\n"
                + (items.isBlank() ? "" : "Items:\n" + items + "\n\n")
                + "We'll notify you when your shipment is on the way.\n\n"
                + "— Nexus";
        sendPlain(toEmail, "Order confirmation #" + order.getOrderId(), body);
    }

    private String itemLine(OrderItem item) {
        if (item.getProduct() == null) {
            return "• (product) x" + item.getQuantity();
        }
        String name = item.getProduct().getName() != null ? item.getProduct().getName() : "Item";
        return "• " + name + " x" + item.getQuantity();
    }

    public void sendShipmentShipped(String toEmail, Shipment shipment) {
        Order order = shipment.getOrder();
        Long orderId = order != null ? order.getOrderId() : null;
        String tn = shipment.getTrackingNumber() != null ? shipment.getTrackingNumber() : "—";
        String carrier = shipment.getCarrier() != null ? shipment.getCarrier() : "carrier";
        String body = "Hello,\n\n"
                + "Your order" + (orderId != null ? " #" + orderId : "") + " has been handed to " + carrier + ".\n\n"
                + "Tracking number: " + tn + "\n\n"
                + "You can track your package from your orders page in Nexus.\n\n"
                + "— Nexus";
        sendPlain(toEmail, "Your order has shipped" + (orderId != null ? " (#" + orderId + ")" : ""), body);
    }

    public void sendLowStockAlert(String toEmail, Product product, int threshold) {
        String name = product != null && product.getName() != null ? product.getName() : "Product";
        Integer stock = product != null ? product.getStockQuantity() : null;
        String body = "Hello,\n\n"
                + "Low stock alert for your product.\n\n"
                + "Product: " + name + "\n"
                + "Current stock: " + (stock != null ? stock : "—") + "\n"
                + "Threshold: " + threshold + "\n\n"
                + "Consider replenishing inventory to avoid missed sales.\n\n"
                + "— Nexus";
        sendPlain(toEmail, "Low stock alert — " + name, body);
    }

    private void sendPlain(String to, String subject, String text) {
        if (!mailEnabled()) {
            log.info("[Mail disabled — configure spring.mail.host] To: {} | Subject: {} | Body:\n{}", to, subject, text);
            return;
        }
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromAddress);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(text);
            mailSender.send(msg);
            log.debug("Mail sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send mail to {}: {}", to, e.getMessage());
        }
    }
}
