package com.ecommerce.backend.Controller;


import com.ecommerce.backend.dto.response.AnalyticsResponse;
import com.ecommerce.backend.dto.response.DailyRevenueDto;
import com.ecommerce.backend.dto.response.ProductSalesDto;
import com.ecommerce.backend.Services.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsResponse> getAnalyticsSummary(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getAnalyticsSummary(startDate, endDate));
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ProductSalesDto>> getTopSellingProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsService.getTopSellingProducts(limit));
    }

    @GetMapping("/revenue/daily")
    public ResponseEntity<List<DailyRevenueDto>> getRevenuePerDay(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getRevenuePerDay(startDate, endDate));
    }

    @GetMapping("/revenue/product/{id}")
    public ResponseEntity<List<ProductSalesDto>> getSalesPerProduct(@PathVariable Long id) {
        return ResponseEntity.ok(analyticsService.getSalesPerProduct(id));
    }

    @GetMapping("/orders/status")
    public ResponseEntity<Map<String, Long>> getOrdersByStatus() {
        return ResponseEntity.ok(analyticsService.getOrdersByStatus());
    }

    @GetMapping("/revenue/total")
    public ResponseEntity<java.math.BigDecimal> getTotalRevenue() {
        return ResponseEntity.ok(analyticsService.getTotalRevenue());
    }
}