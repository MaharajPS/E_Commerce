package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.RewardPoints;
import com.ecommerce.backend.entity.RewardTransaction;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.RewardPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardPointsController {

    private final RewardPointsService rewardPointsService;
    private final UserRepository userRepository;

    private Long getUserId(org.springframework.security.core.userdetails.UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<RewardPoints> getRewardPoints(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(rewardPointsService.getRewardPointsByUserId(getUserId(userDetails)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<RewardTransaction>> getRewardHistory(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(rewardPointsService.getRewardHistory(getUserId(userDetails)));
    }
}
