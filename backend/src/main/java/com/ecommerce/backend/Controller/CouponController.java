package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.entity.Coupon;
import com.ecommerce.backend.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    /** Public: Get all active coupons (for customers to browse) */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Coupon>>> getActiveCoupons() {
        return ResponseEntity.ok(ApiResponse.success("Active coupons", couponService.getActiveCoupons()));
    }

    /** Public: Get coupon by code */
    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Coupon>> getCoupon(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success("Coupon found", couponService.getCouponByCode(code)));
    }

    /** Public: Validate coupon against an order total */
    @GetMapping("/validate/{code}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateCoupon(
            @PathVariable String code,
            @RequestParam(defaultValue = "0") BigDecimal orderTotal) {
        Map<String, Object> result = couponService.validateCoupon(code, orderTotal);
        return ResponseEntity.ok(ApiResponse.success("Coupon is valid", result));
    }

    /** Admin/SuperAdmin: Get all coupons */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success("All coupons", couponService.getAllCoupons()));
    }

    /** SuperAdmin: Create coupon */
    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon created", couponService.createCoupon(coupon)));
    }

    /** SuperAdmin: Update coupon */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.updateCoupon(id, coupon)));
    }

    /** SuperAdmin: Deactivate coupon */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateCoupon(@PathVariable Long id) {
        couponService.deactivateCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deactivated", null));
    }

    /** SuperAdmin: Delete coupon */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}
