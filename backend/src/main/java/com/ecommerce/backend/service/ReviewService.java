package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Review addReview(Long userId, Long productId, int rating, String comment) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Review review = Review.builder()
                .customer(customer)
                .product(product)
                .rating(rating)
                .comment(comment)
                .build();
        return reviewRepository.save(review);
    }

    public List<Review> getProductReviews(Long productId) {
        return reviewRepository.findByProductProductId(productId);
    }

    public Double getAverageRating(Long productId) {
        return reviewRepository.getAverageRatingByProductId(productId);
    }
}
