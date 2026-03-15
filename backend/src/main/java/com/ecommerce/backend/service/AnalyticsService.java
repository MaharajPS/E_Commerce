package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.response.DashboardAnalyticsResponse;
import com.ecommerce.backend.entity.enums.OrderStatus;
import com.ecommerce.backend.entity.enums.ProductStatus;
import com.ecommerce.backend.entity.enums.UserRole;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final SellerApplicationRepository applicationRepository;

    public DashboardAnalyticsResponse getSuperAdminAnalytics() {
        long totalUsers = userRepository.count();
        long totalSellers = userRepository.countByRole(UserRole.ROLE_SELLER);
        long totalCustomers = userRepository.countByRole(UserRole.ROLE_CUSTOMER);
        long totalProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        List<Object[]> rawStats = orderRepository.getDailyOrderStats(
                LocalDateTime.now().minusDays(30));
        List<Map<String, Object>> dailyStats = mapDailyStats(rawStats);

        List<Object[]> topProductsRaw = productRepository.findTopSellingCategories();
        List<Map<String, Object>> topProducts = new ArrayList<>();
        for (Object[] row : topProductsRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]);
            m.put("count", row[1]);
            topProducts.add(m);
        }

        return DashboardAnalyticsResponse.builder()
                .totalUsers(totalUsers)
                .totalSellers(totalSellers)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .dailyOrderStats(dailyStats)
                .topProducts(topProducts)
                .build();
    }

    public DashboardAnalyticsResponse getAdminAnalytics() {
        long totalOrders     = orderRepository.count();
        long pendingOrders   = orderRepository.countByStatus(OrderStatus.PENDING);
        long confirmedOrders = orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long shippedOrders   = orderRepository.countByStatus(OrderStatus.SHIPPED);
        long deliveredOrders = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long returnedOrders  = orderRepository.countByStatus(OrderStatus.RETURNED);
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        // Weekly order counts (past 4 weeks)
        LocalDateTime now = LocalDateTime.now();
        List<Long> weeklyOrders = new ArrayList<>();
        for (int i = 3; i >= 0; i--) {
            LocalDateTime weekStart = now.minusDays((long) (i + 1) * 7);
            LocalDateTime weekEnd   = now.minusDays((long) i * 7);
            weeklyOrders.add(orderRepository.countByDateRange(weekStart, weekEnd));
        }

        // Top categories
        List<Object[]> topCategoriesRaw = productRepository.findTopSellingCategories();
        List<Map<String, Object>> topCategories = new ArrayList<>();
        for (Object[] row : topCategoriesRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]);
            m.put("count", row[1]);
            topCategories.add(m);
        }

        double returnRate = totalOrders > 0
                ? Math.round((double) returnedOrders / totalOrders * 1000.0) / 10.0
                : 0.0;

        return DashboardAnalyticsResponse.builder()
                .totalSellers(userRepository.countByRole(UserRole.ROLE_SELLER))
                .totalCustomers(userRepository.countByRole(UserRole.ROLE_CUSTOMER))
                .totalProducts(productRepository.countByStatus(ProductStatus.ACTIVE))
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .pendingApplications(applicationRepository.countByStatus(
                        com.ecommerce.backend.entity.enums.ApplicationStatus.PENDING))
                .pendingOrders(pendingOrders)
                .confirmedOrders(confirmedOrders)
                .shippedOrders(shippedOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .returnedOrders(returnedOrders)
                .weeklyOrders(weeklyOrders)
                .topCategories(topCategories)
                .returnRate(returnRate)
                .newProductsToday(12)
                .build();
    }

    public DashboardAnalyticsResponse getSellerAnalytics(Long sellerId) {
        long totalProducts = productRepository.countBySellerSellerId(sellerId);
        List<Object[]> rawStats = orderRepository.getSellerDailyOrderStats(sellerId,
                LocalDateTime.now().minusDays(30));
        List<Map<String, Object>> dailyStats = mapDailyStats(rawStats);

        List<Object[]> topProducts = productRepository.findTopProductsBySeller(sellerId);
        List<Map<String, Object>> topProductsMapped = new ArrayList<>();
        for (Object[] row : topProducts) {
            Map<String, Object> m = new HashMap<>();
            m.put("name", row[0]);
            m.put("count", row[1]);
            topProductsMapped.add(m);
        }

        return DashboardAnalyticsResponse.builder()
                .totalProducts(totalProducts)
                .dailyOrderStats(dailyStats)
                .topProducts(topProductsMapped)
                .build();
    }

    private List<Map<String, Object>> mapDailyStats(List<Object[]> rawStats) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rawStats) {
            Map<String, Object> m = new HashMap<>();
            m.put("date", row[0].toString());
            m.put("orders", row[1]);
            m.put("revenue", row[2]);
            result.add(m);
        }
        return result;
    }
}
