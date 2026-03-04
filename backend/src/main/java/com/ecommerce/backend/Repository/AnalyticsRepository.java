package com.ecommerce.backend.Repository;


import com.ecommerce.backend.Model.Order;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class AnalyticsRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Object[]> getTopSellingProducts(int limit) {
        String query = """
            SELECT p.id, p.name, SUM(oi.quantity) as totalSold,
                   SUM(oi.quantity * oi.priceAtPurchase) as revenue
            FROM OrderItem oi
            JOIN oi.product p
            JOIN oi.order o
            WHERE o.status != 'CANCELLED'
            GROUP BY p.id, p.name
            ORDER BY totalSold DESC
            """;

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query, Object[].class);
        typedQuery.setMaxResults(limit);
        return typedQuery.getResultList();
    }

    public List<Object[]> getRevenuePerDay(LocalDate startDate, LocalDate endDate) {
        String query = """
            SELECT DATE(o.createdAt) as saleDate, SUM(o.totalAmount) as dailyRevenue
            FROM Order o
            WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
            AND DATE(o.createdAt) BETWEEN :startDate AND :endDate
            GROUP BY DATE(o.createdAt)
            ORDER BY saleDate DESC
            """;

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query, Object[].class);
        typedQuery.setParameter("startDate", startDate);
        typedQuery.setParameter("endDate", endDate);
        return typedQuery.getResultList();
    }

    public List<Object[]> getSalesPerProduct(Long productId) {
        String query = """
            SELECT p.id, p.name, SUM(oi.quantity) as totalSold,
                   SUM(oi.quantity * oi.priceAtPurchase) as revenue
            FROM OrderItem oi
            JOIN oi.product p
            JOIN oi.order o
            WHERE p.id = :productId AND o.status != 'CANCELLED'
            GROUP BY p.id, p.name
            """;

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query, Object[].class);
        typedQuery.setParameter("productId", productId);
        return typedQuery.getResultList();
    }

    public Map<String, Long> getOrdersByStatus() {
        String query = """
            SELECT o.status, COUNT(o) as count
            FROM Order o
            GROUP BY o.status
            """;

        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query, Object[].class);
        List<Object[]> results = typedQuery.getResultList();

        Map<String, Long> statusCount = new HashMap<>();
        for (Object[] result : results) {
            statusCount.put(result[0].toString(), (Long) result[1]);
        }
        return statusCount;
    }

    public BigDecimal getTotalRevenue() {
        String query = """
            SELECT SUM(o.totalAmount)
            FROM Order o
            WHERE o.status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
            """;

        TypedQuery<BigDecimal> typedQuery = entityManager.createQuery(query, BigDecimal.class);
        BigDecimal result = typedQuery.getSingleResult();
        return result != null ? result : BigDecimal.ZERO;
    }

    public Long getTotalOrders() {
        String query = "SELECT COUNT(o) FROM Order o";
        TypedQuery<Long> typedQuery = entityManager.createQuery(query, Long.class);
        return typedQuery.getSingleResult();
    }

    public Long getTotalCustomers() {
        String query = """
            SELECT COUNT(DISTINCT o.customer.id)
            FROM Order o
            WHERE o.status != 'CANCELLED'
            """;
        TypedQuery<Long> typedQuery = entityManager.createQuery(query, Long.class);
        return typedQuery.getSingleResult();
    }
}
