package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.RewardPoints;
import com.ecommerce.backend.entity.RewardTransaction;
import com.ecommerce.backend.entity.enums.RewardTransactionType;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.RewardPointsRepository;
import com.ecommerce.backend.repository.RewardTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RewardPointsService {

    private final RewardPointsRepository rewardPointsRepository;
    private final RewardTransactionRepository rewardTransactionRepository;
    private final CustomerRepository customerRepository;

    public RewardPoints getRewardPointsByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return rewardPointsRepository.findByCustomerCustomerId(customer.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Reward points not found"));
    }

    public List<RewardTransaction> getRewardHistory(Long userId) {
        RewardPoints rewardPoints = getRewardPointsByUserId(userId);
        return rewardTransactionRepository.findByRewardPointsRewardIdOrderByCreatedAtDesc(rewardPoints.getRewardId());
    }

    @Transactional
    public void earnPoints(Long customerId, Integer points, String referenceType, Long referenceId) {
        if (points <= 0) return;

        RewardPoints rewardPoints = rewardPointsRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward points not found"));

        rewardPoints.setPointsBalance(rewardPoints.getPointsBalance() + points);
        rewardPointsRepository.save(rewardPoints);

        RewardTransaction transaction = RewardTransaction.builder()
                .rewardPoints(rewardPoints)
                .points(points)
                .transactionType(RewardTransactionType.EARN)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        rewardTransactionRepository.save(transaction);
    }

    @Transactional
    public void redeemPoints(Long customerId, Integer points, String referenceType, Long referenceId) {
        if (points <= 0) return;

        RewardPoints rewardPoints = rewardPointsRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward points not found"));

        if (rewardPoints.getPointsBalance() < points) {
            throw new RuntimeException("Insufficient reward points");
        }

        rewardPoints.setPointsBalance(rewardPoints.getPointsBalance() - points);
        rewardPointsRepository.save(rewardPoints);

        RewardTransaction transaction = RewardTransaction.builder()
                .rewardPoints(rewardPoints)
                .points(points)
                .transactionType(RewardTransactionType.REDEEM)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        rewardTransactionRepository.save(transaction);
    }
}
