package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUserEmail(String email);
    Optional<Admin> findByUserId(Long userId);
}
