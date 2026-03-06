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
                        .productId(asLong(row[0]))
                        .productName(asString(row[1]))
                        .totalSold(asLong(row[2]))
                        .revenue(asBigDecimal(row[3]))
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
                        .saleDate(asLocalDate(row[0]))
                        .dailyRevenue(asBigDecimal(row[1]))
                        .build())
                .collect(Collectors.toList());
    }

    public List<ProductSalesDto> getSalesPerProduct(Long productId) {
        List<Object[]> results = analyticsRepository.getSalesPerProduct(productId);
        return results.stream()
                .map(row -> ProductSalesDto.builder()
                        .productId(asLong(row[0]))
                        .productName(asString(row[1]))
                        .totalSold(asLong(row[2]))
                        .revenue(asBigDecimal(row[3]))
                        .build())
                .collect(Collectors.toList());
    }

    private Long asLong(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private String asString(Object val) {
        return val == null ? "" : val.toString();
    }

    private BigDecimal asBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        return new BigDecimal(val.toString());
    }

    private LocalDate asLocalDate(Object val) {
        if (val == null) return null;
        if (val instanceof LocalDate) return (LocalDate) val;
        if (val instanceof java.sql.Date) return ((java.sql.Date) val).toLocalDate();
        if (val instanceof java.util.Date) {
             return new java.sql.Date(((java.util.Date) val).getTime()).toLocalDate();
        }
        return LocalDate.parse(val.toString());
    }

    public Map<String, Long> getOrdersByStatus() {
        return analyticsRepository.getOrdersByStatus();
    }

    public BigDecimal getTotalRevenue() {
        return analyticsRepository.getTotalRevenue();
    }
}