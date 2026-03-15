package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductProductId(Long productId);
    List<Review> findByCustomerCustomerId(Long customerId);
    boolean existsByProductProductIdAndCustomerCustomerId(Long productId, Long customerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.productId = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);
}
