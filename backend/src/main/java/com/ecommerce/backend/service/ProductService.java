package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.ProductRequest;
import com.ecommerce.backend.dto.response.ProductResponse;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.entity.enums.ProductStatus;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SellerRepository sellerRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public ProductResponse createProduct(Long userId, ProductRequest request) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .seller(seller)
                .status(ProductStatus.ACTIVE)
                .images(new ArrayList<>())
                .build();

        product = productRepository.save(product);

        // Process images
        if (request.getImageUrls() != null) {
            for (String url : request.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .isPrimary(url.equals(request.getPrimaryImageUrl()))
                        .build();
                product.getImages().add(img);
            }
            product = productRepository.save(product);
        }

        return toResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long userId, Long productId, ProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        if (!product.getSeller().getSellerId().equals(seller.getSellerId())) {
            throw new SecurityException("Not authorized to update this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            product.setCategory(category);
        }

        // Update images
        if (request.getImageUrls() != null) {
            product.getImages().clear();
            for (String url : request.getImageUrls()) {
                ProductImage img = ProductImage.builder()
                        .product(product)
                        .imageUrl(url)
                        .isPrimary(url.equals(request.getPrimaryImageUrl()))
                        .build();
                product.getImages().add(img);
            }
        }

        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long userId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        if (!product.getSeller().getSellerId().equals(seller.getSellerId())) {
            throw new SecurityException("Not authorized to delete this product");
        }

        product.setStatus(ProductStatus.DELETED);
        productRepository.save(product);
    }

    @Transactional
    public ProductResponse toggleProductStatus(Long userId, Long productId, ProductStatus status) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));

        if (!product.getSeller().getSellerId().equals(seller.getSellerId())) {
            throw new SecurityException("Not authorized");
        }

        product.setStatus(status);
        return toResponse(productRepository.save(product));
    }

    public Page<ProductResponse> searchProducts(String keyword, Long categoryId,
                                                 BigDecimal minPrice, BigDecimal maxPrice,
                                                 Pageable pageable) {
        return productRepository.searchProducts(keyword, categoryId, minPrice, maxPrice, pageable)
                .map(this::toResponse);
    }

    public ProductResponse getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return toResponse(product);
    }

    public List<ProductResponse> getSellerProducts(Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));
        return productRepository.findBySellerSellerId(seller.getSellerId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Admin: deactivate any product
    @Transactional
    public ProductResponse adminDeactivateProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setStatus(ProductStatus.INACTIVE);
        return toResponse(productRepository.save(product));
    }

    public List<ProductResponse> getSimilarProducts(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        BigDecimal minPrice = product.getPrice().multiply(BigDecimal.valueOf(0.7));
        BigDecimal maxPrice = product.getPrice().multiply(BigDecimal.valueOf(1.3));

        return productRepository.findSimilarProducts(
                product.getCategory() != null ? product.getCategory().getCategoryId() : null,
                minPrice,
                maxPrice,
                productId,
                Pageable.ofSize(5)
        ).getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getRecommendations(Long userId) {
        // AI Logic: Recently viewed + Purchase history + Top selling
        return productRepository.findRecommendations(userId, Pageable.ofSize(10))
                .getContent().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductResponse> getLowStockProducts(Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller profile not found"));
        
        return productRepository.findLowStockProducts(seller.getSellerId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse toResponse(Product product) {
        List<String> imageUrls = product.getImages() != null
                ? product.getImages().stream().map(ProductImage::getImageUrl).collect(Collectors.toList())
                : new ArrayList<>();

        String primaryImage = product.getImages() != null
                ? product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(imageUrls.isEmpty() ? null : imageUrls.get(0))
                : null;

        Double avgRating = reviewRepository.getAverageRatingByProductId(product.getProductId());
        int reviewCount = product.getReviews() != null ? product.getReviews().size() : 0;

        return ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .sellerId(product.getSeller().getSellerId())
                .sellerName(product.getSeller().getBusinessName())
                .storeName(product.getSeller().getStoreName())
                .status(product.getStatus())
                .imageUrls(imageUrls)
                .primaryImageUrl(primaryImage)
                .averageRating(avgRating)
                .reviewCount(reviewCount)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
