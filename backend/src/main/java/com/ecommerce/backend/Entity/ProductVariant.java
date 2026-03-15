package com.ecommerce.backend.entity;

import com.ecommerce.backend.entity.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long variantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(unique = true)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 5;

    @OneToMany(mappedBy = "variant", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<VariantAttribute> attributes;
}
