package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletWalletIdOrderByCreatedAtDesc(Long walletId);
}
