package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.dto.response.DashboardAnalyticsResponse;
import com.ecommerce.backend.entity.Seller;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.entity.enums.SellerStatus;
import com.ecommerce.backend.entity.enums.UserStatus;
import com.ecommerce.backend.entity.Admin;
import com.ecommerce.backend.entity.enums.UserRole;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final SellerRepository sellerRepository;
    private final CustomerRepository customerRepository;
    private final AnalyticsService analyticsService;
    private final PasswordEncoder passwordEncoder;

    // Platform Analytics
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<DashboardAnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Platform analytics",
                analyticsService.getSuperAdminAnalytics()));
    }

    // Admin management
    @GetMapping("/admins")
    public ResponseEntity<ApiResponse<List<Admin>>> getAllAdmins() {
        return ResponseEntity.ok(ApiResponse.success("Admins fetched", adminRepository.findAll()));
    }

    @PostMapping("/admins")
    public ResponseEntity<ApiResponse<Admin>> createAdmin(@RequestBody Map<String, String> body) {
        if (userRepository.existsByEmail(body.get("email"))) {
            throw new RuntimeException("Email already in use");
        }
        User user = User.builder()
                .email(body.get("email"))
                .password(passwordEncoder.encode(body.get("password")))
                .role(UserRole.ROLE_ADMIN)
                .build();
        user = userRepository.save(user);

        Admin admin = Admin.builder()
                .user(user)
                .name(body.get("name"))
                .phone(body.get("phone"))
                .build();
        return ResponseEntity.ok(ApiResponse.success("Admin created", adminRepository.save(admin)));
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAdmin(@PathVariable Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        userRepository.delete(admin.getUser());
        return ResponseEntity.ok(ApiResponse.success("Admin deleted", null));
    }

    // User management
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched", userRepository.findAll()));
    }

    @PatchMapping("/users/{id}/block")
    public ResponseEntity<ApiResponse<User>> blockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.BLOCKED);
        return ResponseEntity.ok(ApiResponse.success("User blocked", userRepository.save(user)));
    }

    @PatchMapping("/users/{id}/unblock")
    public ResponseEntity<ApiResponse<User>> unblockUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        return ResponseEntity.ok(ApiResponse.success("User unblocked", userRepository.save(user)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    // Sellers
    @GetMapping("/sellers")
    public ResponseEntity<ApiResponse<List<Seller>>> getAllSellers() {
        return ResponseEntity.ok(ApiResponse.success("Sellers fetched", sellerRepository.findAll()));
    }

    @PatchMapping("/sellers/{id}/block")
    public ResponseEntity<ApiResponse<Seller>> blockSeller(@PathVariable Long id) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        seller.setStatus(SellerStatus.BLOCKED);
        return ResponseEntity.ok(ApiResponse.success("Seller blocked", sellerRepository.save(seller)));
    }
}
