package com.ecommerce.backend.controller;

import com.ecommerce.backend.entity.ProductVariant;
import com.ecommerce.backend.service.ProductVariantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
@RequiredArgsConstructor
public class ProductVariantController {

    private final ProductVariantService productVariantService;

    @GetMapping
    public ResponseEntity<List<ProductVariant>> getVariants(@PathVariable Long productId) {
        return ResponseEntity.ok(productVariantService.getVariantsByProductId(productId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SELLER', 'ADMIN')")
    public ResponseEntity<ProductVariant> addVariant(@PathVariable Long productId, @RequestBody ProductVariant variant) {
        return ResponseEntity.ok(productVariantService.addVariant(productId, variant));
    }
}
