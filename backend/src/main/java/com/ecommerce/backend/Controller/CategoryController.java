package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Category fetched", categoryService.getCategoryById(id)));
    }
}
