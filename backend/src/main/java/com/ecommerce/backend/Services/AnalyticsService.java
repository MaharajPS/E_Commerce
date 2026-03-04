package com.ecommerce.backend.Services;


import com.ecommerce.backend.dto.response.*;
import com.ecommerce.backend.Repository.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    public AnalyticsResponse getAnalyticsSummary(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<ProductSalesDto> topProducts = getTopSellingProducts(5);
        List<DailyRevenueDto> dailyRevenue = getRevenuePerDay(startDate, endDate);

        return AnalyticsResponse.builder()
                .totalOrders(analyticsRepository.getTotalOrders())
                .totalCustomers(analyticsRepository.getTotalCustomers())
                .totalRevenue(analyticsRepository.getTotalRevenue())
                .ordersByStatus(analyticsRepository.getOrdersByStatus())
                .topSellingProducts(topProducts)
                .dailyRevenue(dailyRevenue)
                .build();
    }

    public List<ProductSalesDto> getTopSellingProducts(int limit) {
        List<Object[]> results = analyticsRepository.getTopSellingProducts(limit);
        return results.stream()
                .map(row -> ProductSalesDto.builder()
                        .productId(((Number) row[0]).longValue())
                        .productName((String) row[1])
                        .totalSold(((Number) row[2]).longValue())
                        .revenue((BigDecimal) row[3])
                        .build())
                .collect(Collectors.toList());
    }

    public List<DailyRevenueDto> getRevenuePerDay(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = LocalDate.now().minusMonths(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<Object[]> results = analyticsRepository.getRevenuePerDay(startDate, endDate);
        return results.stream()
                .map(row -> DailyRevenueDto.builder()
                        .saleDate((LocalDate) row[0])
                        .dailyRevenue((BigDecimal) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    public List<ProductSalesDto> getSalesPerProduct(Long productId) {
        List<Object[]> results = analyticsRepository.getSalesPerProduct(productId);
        return results.stream()
                .map(row -> ProductSalesDto.builder()
                        .productId(((Number) row[0]).longValue())
                        .productName((String) row[1])
                        .totalSold(((Number) row[2]).longValue())
                        .revenue((BigDecimal) row[3])
                        .build())
                .collect(Collectors.toList());
    }

    public Map<String, Long> getOrdersByStatus() {
        return analyticsRepository.getOrdersByStatus();
    }

    public BigDecimal getTotalRevenue() {
        return analyticsRepository.getTotalRevenue();
    }
}