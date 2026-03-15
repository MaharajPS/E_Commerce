package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerCustomerId(Long customerId);
    List<Order> findByCustomerUserId(Long userId);
    Page<Order> findByCustomerCustomerId(Long customerId, Pageable pageable);
    long countByStatus(OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status NOT IN ('CANCELLED')")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.customer.customerId IN " +
           "(SELECT c.customerId FROM Customer c JOIN c.orders WHERE c.cart.cartId IN " +
           "(SELECT ci.cart.cartId FROM CartItem ci WHERE ci.product.seller.sellerId = :sellerId))")
    BigDecimal getSellerRevenue(@Param("sellerId") Long sellerId);

    @Query("SELECT DATE(o.createdAt) as orderDate, COUNT(o) as orderCount, SUM(o.totalAmount) as revenue " +
           "FROM Order o WHERE o.createdAt >= :startDate GROUP BY DATE(o.createdAt) ORDER BY orderDate")
    List<Object[]> getDailyOrderStats(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT DATE(o.createdAt) as orderDate, COUNT(o) as orderCount, SUM(o.totalAmount) as revenue " +
           "FROM Order o JOIN o.items oi WHERE oi.product.seller.sellerId = :sellerId AND o.createdAt >= :startDate " +
           "GROUP BY DATE(o.createdAt) ORDER BY orderDate")
    List<Object[]> getSellerDailyOrderStats(@Param("sellerId") Long sellerId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT o FROM Order o JOIN o.items oi WHERE oi.product.seller.sellerId = :sellerId")
    List<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    long countByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED' AND o.createdAt >= :startDate")
    BigDecimal getRevenueFromDelivered(@Param("startDate") LocalDateTime startDate);
}
