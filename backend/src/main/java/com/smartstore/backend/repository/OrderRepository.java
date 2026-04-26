package com.smartstore.backend.repository;

import com.smartstore.backend.model.Order;
import com.smartstore.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN o.user u
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.product p
            LEFT JOIN FETCH p.store s
            WHERE u.userId = :userId
            ORDER BY o.orderDate DESC
            """)
    List<Order> findByUserIdWithItemsAndProducts(@Param("userId") Long userId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.orderId = :id")
    Optional<Order> findDetailedById(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            JOIN FETCH o.user u
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.product p
            LEFT JOIN p.store s
            WHERE s.ownerId = :ownerId
            ORDER BY o.orderDate DESC
            """)
    List<Order> findStoreOrdersByOwnerId(@Param("ownerId") Long ownerId);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.items i")
    List<Order> findAllWithItems();

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.items i
            LEFT JOIN FETCH i.product p
            LEFT JOIN FETCH p.store s
            """)
    List<Order> findAllWithItemsAndProducts();
}
