package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.ProductVariant;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductVariantService {

    private final ProductVariantRepository productVariantRepository;
    private final ProductRepository productRepository;

    public List<ProductVariant> getVariantsByProductId(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found");
        }
        return productVariantRepository.findByProductProductId(productId);
    }

    public ProductVariant addVariant(Long productId, ProductVariant variant) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        variant.setProduct(product);
        return productVariantRepository.save(variant);
    }
}
