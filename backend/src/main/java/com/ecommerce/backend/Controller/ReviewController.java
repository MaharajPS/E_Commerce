package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping("/{productId}/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched",
                reviewRepository.findByProductProductId(productId)));
    }
}
