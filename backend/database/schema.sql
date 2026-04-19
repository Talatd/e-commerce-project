-- SmartStore AI 2026 Database Schema (3NF)

CREATE DATABASE IF NOT EXISTS smartstore_db;
USE smartstore_db;

-- 1. Users Table (RBAC Support)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('ADMIN', 'MANAGER', 'CONSUMER') NOT NULL DEFAULT 'CONSUMER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    base_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Regional Inventory (Requirement DS4/DS5)
CREATE TABLE regional_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    region VARCHAR(100) NOT NULL, -- e.g., 'US', 'PK', 'EU'
    stock_quantity INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 4. Orders Table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    status ENUM('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 5. Order Items Table (Normalization)
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 6. Product Reviews (Sentiment Data Support - DS6)
CREATE TABLE product_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    sentiment_score DECIMAL(3, 2), -- Score from Sentiment Analysis API
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 7. Stores Table
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    owner_name VARCHAR(100),
    owner_id INT,
    total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    order_count INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    status ENUM('OPEN', 'CLOSED', 'PENDING') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(user_id)
);

-- 8. Shipments Table (DS3 — E-Commerce Shipping Data)
CREATE TABLE shipments (
    shipment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    warehouse_block VARCHAR(10),
    mode_of_shipment VARCHAR(50),
    carrier VARCHAR(100),
    tracking_number VARCHAR(100),
    status ENUM('PREPARING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED') DEFAULT 'PREPARING',
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    estimated_delivery TIMESTAMP NULL,
    customer_care_calls INT DEFAULT 0,
    customer_rating TINYINT,
    cost_of_product DECIMAL(10, 2),
    prior_purchases INT DEFAULT 0,
    product_importance ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    discount_offered DECIMAL(5, 2) DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    INDEX idx_shipment_order (order_id),
    INDEX idx_shipment_tracking (tracking_number),
    INDEX idx_shipment_status (status)
);

-- 9. Categories Table (Hierarchical product categories)
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    parent_id INT NULL,
    display_order INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL,
    INDEX idx_category_parent (parent_id),
    INDEX idx_category_active (active)
);

-- 10. Customer Profiles (DS2 — E-Commerce Customer Behavior)
CREATE TABLE customer_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    gender VARCHAR(20),
    age INT,
    city VARCHAR(100),
    country VARCHAR(100),
    membership_type ENUM('BASIC', 'SILVER', 'GOLD', 'PLATINUM') DEFAULT 'BASIC',
    total_spend DECIMAL(12, 2) DEFAULT 0.00,
    items_purchased INT DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    discount_applied BOOLEAN DEFAULT FALSE,
    satisfaction_level ENUM('UNSATISFIED', 'NEUTRAL', 'SATISFIED', 'VERY_SATISFIED') DEFAULT 'NEUTRAL',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_profile_user (user_id),
    INDEX idx_profile_membership (membership_type)
);

-- 11. Integration Logs (Admin Visibility)
CREATE TABLE integration_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100),
    endpoint VARCHAR(255),
    status_code INT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes on core tables
CREATE INDEX idx_product_category ON products(category);
CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_order_date ON orders(order_date);
CREATE INDEX idx_orderitem_order ON order_items(order_id);
CREATE INDEX idx_orderitem_product ON order_items(product_id);
CREATE INDEX idx_review_product ON product_reviews(product_id);
CREATE INDEX idx_review_user ON product_reviews(user_id);
CREATE INDEX idx_inventory_product ON regional_inventory(product_id);
