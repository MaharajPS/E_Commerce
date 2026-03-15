package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Coupon;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public List<Coupon> getActiveCoupons() {
        return couponRepository.findAll().stream()
                .filter(c -> Boolean.TRUE.equals(c.getIsActive()))
                .filter(c -> c.getExpiryDate() == null || c.getExpiryDate().isAfter(LocalDateTime.now()))
                .filter(c -> c.getUsageLimit() == null || c.getUsedCount() < c.getUsageLimit())
                .toList();
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
    }

    /**
     * Validates coupon against order total and returns discount details.
     * Throws RuntimeException if coupon is invalid.
     */
    public Map<String, Object> validateCoupon(String code, BigDecimal orderTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Coupon \"" + code + "\" not found"));

        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new RuntimeException("Coupon \"" + code + "\" is no longer active");
        }

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon \"" + code + "\" has expired");
        }

        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new RuntimeException("Coupon \"" + code + "\" usage limit has been reached");
        }

        if (coupon.getMinimumOrderAmount() != null && orderTotal.compareTo(coupon.getMinimumOrderAmount()) < 0) {
            throw new RuntimeException("Minimum order amount of ₹" + coupon.getMinimumOrderAmount() + " required for this coupon");
        }

        // Calculate discount
        BigDecimal discount;
        if ("FLAT".equals(coupon.getDiscountType().name())) {
            discount = coupon.getDiscountValue();
        } else {
            // PERCENTAGE
            discount = orderTotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
            if (coupon.getMaximumDiscount() != null && discount.compareTo(coupon.getMaximumDiscount()) > 0) {
                discount = coupon.getMaximumDiscount();
            }
        }
        // Don't exceed order total
        if (discount.compareTo(orderTotal) > 0) discount = orderTotal;

        Map<String, Object> result = new HashMap<>();
        result.put("coupon", coupon);
        result.put("discount", discount);
        result.put("valid", true);
        return result;
    }

    public Coupon createCoupon(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase());
        if (coupon.getUsedCount() == null) coupon.setUsedCount(0);
        if (coupon.getIsActive() == null) coupon.setIsActive(true);
        return couponRepository.save(coupon);
    }

    public Coupon updateCoupon(Long id, Coupon updated) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        existing.setCode(updated.getCode().toUpperCase());
        existing.setDescription(updated.getDescription());
        existing.setDiscountType(updated.getDiscountType());
        existing.setDiscountValue(updated.getDiscountValue());
        existing.setMinimumOrderAmount(updated.getMinimumOrderAmount());
        existing.setMaximumDiscount(updated.getMaximumDiscount());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setUsageLimit(updated.getUsageLimit());
        existing.setIsActive(updated.getIsActive());
        return couponRepository.save(existing);
    }

    public void deactivateCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));
        coupon.setIsActive(false);
        couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    /** Called when an order is placed with this coupon — increments usage */
    public void consumeCoupon(String code) {
        couponRepository.findByCode(code.toUpperCase()).ifPresent(c -> {
            c.setUsedCount((c.getUsedCount() == null ? 0 : c.getUsedCount()) + 1);
            couponRepository.save(c);
        });
    }
}
