package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Wallet;
import com.ecommerce.backend.entity.WalletTransaction;
import com.ecommerce.backend.entity.enums.WalletTransactionType;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.WalletRepository;
import com.ecommerce.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CustomerRepository customerRepository;

    public Wallet getWalletByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return walletRepository.findByCustomerCustomerId(customer.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
    }

    public List<WalletTransaction> getWalletHistory(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        return walletTransactionRepository.findByWalletWalletIdOrderByCreatedAtDesc(wallet.getWalletId());
    }

    @Transactional
    public void creditWallet(Long customerId, BigDecimal amount, String referenceType, Long referenceId) {
        Wallet wallet = walletRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .transactionType(WalletTransactionType.CREDIT)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        walletTransactionRepository.save(transaction);
    }

    @Transactional
    public void debitWallet(Long customerId, BigDecimal amount, String referenceType, Long referenceId) {
        Wallet wallet = walletRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .transactionType(WalletTransactionType.DEBIT)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .build();
        walletTransactionRepository.save(transaction);
    }
}
