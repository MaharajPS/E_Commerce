package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Wishlist;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public List<Wishlist> getWishlist(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return wishlistRepository.findByCustomerCustomerId(customer.getCustomerId());
    }

    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishlistRepository.existsByCustomerCustomerIdAndProductProductId(
                customer.getCustomerId(), productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        Wishlist wishlist = Wishlist.builder().customer(customer).product(product).build();
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        wishlistRepository.deleteByCustomerCustomerIdAndProductProductId(
                customer.getCustomerId(), productId);
    }
}
