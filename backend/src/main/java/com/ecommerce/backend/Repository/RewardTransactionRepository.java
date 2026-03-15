package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.RewardTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    List<RewardTransaction> findByRewardPointsRewardIdOrderByCreatedAtDesc(Long rewardId);
}
