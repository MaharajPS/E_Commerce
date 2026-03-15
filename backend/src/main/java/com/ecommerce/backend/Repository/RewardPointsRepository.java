package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.RewardPoints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardPointsRepository extends JpaRepository<RewardPoints, Long> {
    Optional<RewardPoints> findByCustomerCustomerId(Long customerId);
}
