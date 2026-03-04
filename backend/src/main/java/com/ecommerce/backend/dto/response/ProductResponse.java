package com.ecommerce.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.ecommerce.backend.Entity.Enum.ProductStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer availableQuantity;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}