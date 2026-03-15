package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.SellerApplication;
import com.ecommerce.backend.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SellerApplicationRepository extends JpaRepository<SellerApplication, Long> {
    List<SellerApplication> findByStatus(ApplicationStatus status);
    boolean existsByEmailAndStatus(String email, ApplicationStatus status);
    long countByStatus(ApplicationStatus status);
}
