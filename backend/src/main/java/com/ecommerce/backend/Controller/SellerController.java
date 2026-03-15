package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.ProductRequest;
import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.dto.response.DashboardAnalyticsResponse;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.dto.response.ProductResponse;
import com.ecommerce.backend.entity.enums.OrderStatus;
import com.ecommerce.backend.entity.enums.ProductStatus;
import com.ecommerce.backend.repository.SellerRepository;
import com.ecommerce.backend.security.JwtUtil;
import com.ecommerce.backend.service.AnalyticsService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final AnalyticsService analyticsService;
    private final SellerRepository sellerRepository;
    private final JwtUtil jwtUtil;

    private Long getUserId(UserDetails userDetails) {
        // Extract userId from security context via repository
        return sellerRepository.findByUserEmail(userDetails.getUsername())
                .map(s -> s.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Seller user not found"));
    }

    // Products
    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProductRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Product created",
                productService.createProduct(userId, request)));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Product updated",
                productService.updateProduct(userId, id, request)));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = getUserId(userDetails);
        productService.deleteProduct(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @PatchMapping("/products/{id}/activate")
    public ResponseEntity<ApiResponse<ProductResponse>> activateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Product activated",
                productService.toggleProductStatus(userId, id, ProductStatus.ACTIVE)));
    }

    @PatchMapping("/products/{id}/deactivate")
    public ResponseEntity<ApiResponse<ProductResponse>> deactivateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated",
                productService.toggleProductStatus(userId, id, ProductStatus.INACTIVE)));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyProducts(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Products fetched",
                productService.getSellerProducts(userId)));
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        var seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return ResponseEntity.ok(ApiResponse.success("Orders fetched",
                orderService.getSellerOrders(seller.getSellerId())));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateStatus(orderId, status)));
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getAnalytics(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        var seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched",
                analyticsService.getSellerAnalytics(seller.getSellerId())));
    }
}
