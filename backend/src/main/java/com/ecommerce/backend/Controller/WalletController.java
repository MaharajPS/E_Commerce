package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Wallet;
import com.ecommerce.backend.entity.WalletTransaction;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.WalletService;
import com.ecommerce.backend.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;
    private final PaymentService paymentService;

    private Long getUserId(org.springframework.security.core.userdetails.UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/balance")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Wallet> getWalletBalance(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(walletService.getWalletByUserId(getUserId(userDetails)));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<WalletTransaction>> getWalletHistory(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(walletService.getWalletHistory(getUserId(userDetails)));
    }

    @PostMapping("/add-money")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> addMoney(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Invalid amount");
        }
        Long customerId = walletService.getWalletByUserId(getUserId(userDetails)).getCustomer().getCustomerId();
        walletService.creditWallet(customerId, amount, "DEPOSIT", null);
        return ResponseEntity.ok(Map.of("message", "Money added successfully"));
    }

    @PostMapping("/stripe/create-intent")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createStripeIntent(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @RequestBody Map<String, BigDecimal> payload) {
        BigDecimal amount = payload.get("amount");
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Invalid amount");
        }
        try {
            return ResponseEntity.ok(paymentService.createWalletChargeIntent(getUserId(userDetails), amount));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/stripe/confirm")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> confirmStripePayment(@RequestBody Map<String, String> payload) {
        String paymentIntentId = payload.get("paymentIntentId");
        if (paymentIntentId == null) {
            return ResponseEntity.badRequest().body("Missing paymentIntentId");
        }
        paymentService.confirmWalletCharge(paymentIntentId);
        return ResponseEntity.ok(Map.of("message", "Wallet charged successfully"));
    }
}
