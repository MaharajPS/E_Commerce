package com.ecommerce.backend.dto.response;


import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class DailyRevenueDto {
    private LocalDate saleDate;
    private BigDecimal dailyRevenue;
}
