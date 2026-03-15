package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.Address;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;
    private final UserRepository userRepository;

    private Long getUserId(org.springframework.security.core.userdetails.UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Address>> getMyAddresses(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(addressService.getCustomerAddresses(getUserId(userDetails)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Address> addAddress(@AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails, @RequestBody Address address) {
        return ResponseEntity.ok(addressService.addAddress(getUserId(userDetails), address));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(Map.of("message", "Address deleted successfully"));
    }
}
