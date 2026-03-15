package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.SellerApplicationRequest;
import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.dto.response.DashboardAnalyticsResponse;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.dto.response.ProductResponse;
import com.ecommerce.backend.entity.SellerApplication;
import com.ecommerce.backend.entity.Seller;
import com.ecommerce.backend.entity.enums.ApplicationStatus;
import com.ecommerce.backend.repository.SellerRepository;
import com.ecommerce.backend.service.AnalyticsService;
import com.ecommerce.backend.service.OrderService;
import com.ecommerce.backend.service.ProductService;
import com.ecommerce.backend.service.SellerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SellerApplicationService applicationService;
    private final ProductService productService;
    private final OrderService orderService;
    private final AnalyticsService analyticsService;
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    // Seller Applications
    @GetMapping("/applications")
    public ResponseEntity<ApiResponse<List<SellerApplication>>> getAllApplications() {
        return ResponseEntity.ok(ApiResponse.success("Applications fetched",
                applicationService.getAllApplications()));
    }

    @GetMapping("/applications/pending")
    public ResponseEntity<ApiResponse<List<SellerApplication>>> getPendingApplications() {
        return ResponseEntity.ok(ApiResponse.success("Pending applications fetched",
                applicationService.getApplicationsByStatus(ApplicationStatus.PENDING)));
    }

    @PostMapping("/applications/{id}/approve")
    public ResponseEntity<ApiResponse<SellerApplication>> approveApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        return ResponseEntity.ok(ApiResponse.success("Application approved",
                applicationService.approveApplication(id, remarks, passwordEncoder)));
    }

    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<ApiResponse<SellerApplication>> rejectApplication(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.getOrDefault("remarks", "") : "";
        return ResponseEntity.ok(ApiResponse.success("Application rejected",
                applicationService.rejectApplication(id, remarks)));
    }

    // Seller management
    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<Seller>>> getAllSellers() {
        return ResponseEntity.ok(ApiResponse.success("Sellers fetched", sellerRepository.findAll()));
    }

    // Products
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String keyword) {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 1000);
        return ResponseEntity.ok(ApiResponse.success("Products fetched",
                productService.searchProducts(keyword, null, null, null, pageable).getContent()));
    }

    @PatchMapping("/products/{id}/deactivate")
    public ResponseEntity<ApiResponse<ProductResponse>> deactivateProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product deactivated",
                productService.adminDeactivateProduct(id)));
    }

    // Orders
    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched", orderService.getAllOrders()));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam com.ecommerce.backend.entity.enums.OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateStatus(id, status)));
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched",
                analyticsService.getAdminAnalytics()));
    }
}
