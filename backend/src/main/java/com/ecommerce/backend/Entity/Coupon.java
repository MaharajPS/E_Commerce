package com.ecommerce.backend.entity;

import com.ecommerce.backend.entity.enums.CouponDiscountType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons", uniqueConstraints = {@UniqueConstraint(columnNames = "code")})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponDiscountType discountType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 10, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal maximumDiscount; // cap for percentage discounts

    private LocalDateTime expiryDate;

    private Integer usageLimit;

    @Builder.Default
    private Integer usedCount = 0;

    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
