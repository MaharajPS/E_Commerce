package com.ecommerce.backend.dto.response;

import com.ecommerce.backend.entity.enums.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ProductResponse {
    private Long productId;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String categoryName;
    private Long categoryId;
    private Long sellerId;
    private String sellerName;
    private String storeName;
    private ProductStatus status;
    private List<String> imageUrls;
    private String primaryImageUrl;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
}
