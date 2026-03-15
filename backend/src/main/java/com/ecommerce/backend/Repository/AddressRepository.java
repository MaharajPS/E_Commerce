package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByCustomerCustomerId(Long customerId);
}
