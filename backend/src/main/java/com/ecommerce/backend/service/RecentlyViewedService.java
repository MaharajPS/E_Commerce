package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.RecentlyViewed;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.RecentlyViewedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RecentlyViewedService {

    private final RecentlyViewedRepository recentlyViewedRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public List<RecentlyViewed> getRecentlyViewed(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return recentlyViewedRepository.findByCustomerCustomerIdOrderByViewedAtDesc(customer.getCustomerId());
    }

    @Transactional
    public void addRecentlyViewed(Long userId, Long productId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Optional<RecentlyViewed> existing = recentlyViewedRepository.findByCustomerCustomerIdAndProductProductId(customer.getCustomerId(), productId);
        if (existing.isPresent()) {
            RecentlyViewed viewed = existing.get();
            viewed.setViewedAt(LocalDateTime.now());
            recentlyViewedRepository.save(viewed);
        } else {
            RecentlyViewed newViewed = RecentlyViewed.builder()
                    .customer(customer)
                    .product(product)
                    .build();
            recentlyViewedRepository.save(newViewed);
        }
    }
}
