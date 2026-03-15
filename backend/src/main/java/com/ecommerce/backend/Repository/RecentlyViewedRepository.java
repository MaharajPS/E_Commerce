package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.RecentlyViewed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecentlyViewedRepository extends JpaRepository<RecentlyViewed, Long> {
    List<RecentlyViewed> findByCustomerCustomerIdOrderByViewedAtDesc(Long customerId);
    Optional<RecentlyViewed> findByCustomerCustomerIdAndProductProductId(Long customerId, Long productId);
}
