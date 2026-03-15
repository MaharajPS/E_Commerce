package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.SellerApplicationRequest;
import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.entity.SellerApplication;
import com.ecommerce.backend.service.SellerApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller-applications")
@RequiredArgsConstructor
public class SellerApplicationController {

    private final SellerApplicationService applicationService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<SellerApplication>> apply(
            @Valid @RequestBody SellerApplicationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Application submitted successfully",
                applicationService.apply(request)));
    }
}
