package com.ecommerce.backend.dto.response;



import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalyticsResponse {
    private Long totalOrders;
    private Long totalCustomers;
    private BigDecimal totalRevenue;
    private Map<String, Long> ordersByStatus;
    private List<ProductSalesDto> topSellingProducts;
    private List<DailyRevenueDto> dailyRevenue;
}
