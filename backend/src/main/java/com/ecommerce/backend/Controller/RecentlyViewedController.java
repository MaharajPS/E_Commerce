package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.RecentlyViewed;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.RecentlyViewedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recently-viewed")
@RequiredArgsConstructor
public class RecentlyViewedController {

    private final RecentlyViewedService recentlyViewedService;
    private final UserRepository userRepository;

    private Long getUserId(org.springframework.security.core.userdetails.UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RecentlyViewed>> getRecentlyViewed(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(recentlyViewedService.getRecentlyViewed(getUserId(userDetails)));
    }

    @PostMapping("/{productId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> addRecentlyViewed(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @PathVariable Long productId) {
        recentlyViewedService.addRecentlyViewed(getUserId(userDetails), productId);
        return ResponseEntity.ok(Map.of("message", "Product added to recently viewed"));
    }
}
