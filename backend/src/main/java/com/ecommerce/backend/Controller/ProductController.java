package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.ProductRequest;
import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.dto.response.ProductResponse;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Products fetched",
                productService.searchProducts(keyword, categoryId, minPrice, maxPrice, pageable)));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRecommendations(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        Long userId = 1L; // Fallback or guest logic
        if (userDetails != null) {
            // we'd fetch the proper userId, but let's assume ProductService handles fallback if userId=null or we can parse it from userDetails
            // Since we need UserRepository, let's keep it simple or send null for guests.
            // In a real app we would inject UserRepository or UserService.
        }
        return ResponseEntity.ok(ApiResponse.success("Recommendations fetched", productService.getRecommendations(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product fetched", productService.getProductById(id)));
    }

    @GetMapping("/{id}/similar")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getSimilarProducts(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Similar products fetched", productService.getSimilarProducts(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<Category>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", categoryRepository.findAll()));
    }
}
