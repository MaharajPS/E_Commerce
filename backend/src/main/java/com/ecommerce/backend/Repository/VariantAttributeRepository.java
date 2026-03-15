package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.VariantAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VariantAttributeRepository extends JpaRepository<VariantAttribute, Long> {
    List<VariantAttribute> findByVariantVariantId(Long variantId);
}
