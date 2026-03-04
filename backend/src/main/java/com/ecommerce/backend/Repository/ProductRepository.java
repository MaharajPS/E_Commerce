package com.ecommerce.backend.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ecommerce.backend.Entity.Enum.ProductStatus;
import com.ecommerce.backend.Entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    List<Product> findByStatus(ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.price ASC")
    List<Product> findByStatusOrderByPriceAsc(@Param("status") ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.status = :status ORDER BY p.price DESC")
    List<Product> findByStatusOrderByPriceDesc(@Param("status") ProductStatus status);

    boolean existsByName(String name);
}