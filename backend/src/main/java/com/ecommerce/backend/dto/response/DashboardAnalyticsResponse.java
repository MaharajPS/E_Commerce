package com.ecommerce.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardAnalyticsResponse {
    // Platform-wide metrics
    private Long totalUsers;
    private Long totalSellers;
    private Long totalCustomers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long pendingApplications;

    // Order status breakdown
    private Long pendingOrders;
    private Long confirmedOrders;
    private Long shippedOrders;
    private Long deliveredOrders;
    private Long cancelledOrders;
    private Long returnedOrders;

    // Weekly order counts [week1, week2, week3, week4]
    private List<Long> weeklyOrders;

    // Rates
    private Double returnRate;
    private Integer newProductsToday;

    // Charts data
    private List<Map<String, Object>> dailyOrderStats;
    private List<Map<String, Object>> topProducts;
    private List<Map<String, Object>> topCategories;
    private List<Map<String, Object>> revenueByCategory;
}
