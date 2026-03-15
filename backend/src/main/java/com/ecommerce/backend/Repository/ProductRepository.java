package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findBySellerSellerIdAndStatus(Long sellerId, ProductStatus status);
    List<Product> findBySellerSellerId(Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:categoryId IS NULL OR p.category.categoryId = :categoryId) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchProducts(@Param("keyword") String keyword,
                                 @Param("categoryId") Long categoryId,
                                 @Param("minPrice") BigDecimal minPrice,
                                 @Param("maxPrice") BigDecimal maxPrice,
                                 Pageable pageable);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);
    long countByStatus(ProductStatus status);
    long countBySellerSellerId(Long sellerId);

    @Query("SELECT p.category.name, SUM(oi.quantity) as totalSold FROM OrderItem oi JOIN oi.product p GROUP BY p.category.name ORDER BY totalSold DESC")
    List<Object[]> findTopSellingCategories();

    @Query("SELECT p.name, SUM(oi.quantity) as totalSold FROM OrderItem oi JOIN oi.product p WHERE p.seller.sellerId = :sellerId GROUP BY p.name ORDER BY totalSold DESC")
    List<Object[]> findTopProductsBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' AND p.productId != :productId AND (" +
           "(:categoryId IS NOT NULL AND p.category.categoryId = :categoryId) OR (p.price >= :minPrice AND p.price <= :maxPrice))")
    Page<Product> findSimilarProducts(@Param("categoryId") Long categoryId,
                                      @Param("minPrice") BigDecimal minPrice,
                                      @Param("maxPrice") BigDecimal maxPrice,
                                      @Param("productId") Long productId,
                                      Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY RANDOM()")
    Page<Product> findRecommendations(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.seller.sellerId = :sellerId AND p.status = 'ACTIVE' AND p.stock < 10")
    List<Product> findLowStockProducts(@Param("sellerId") Long sellerId);
}
