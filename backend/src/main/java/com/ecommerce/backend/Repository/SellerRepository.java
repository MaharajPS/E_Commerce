package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Seller;
import com.ecommerce.backend.entity.enums.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUserId(Long userId);
    Optional<Seller> findByUserEmail(String email);
    List<Seller> findByStatus(SellerStatus status);
}
