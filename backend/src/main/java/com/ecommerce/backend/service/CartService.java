package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.CartItem;
import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public Cart getCart(Long userId) {
        return cartRepository.findByCustomerUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
    }

    @Transactional
    public Cart addToCart(Long userId, Long productId, int quantity) {
        Cart cart = cartRepository.findByCustomerUserId(userId)
                .orElseGet(() -> {
                    Customer customer = customerRepository.findByUserId(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                    Cart newCart = Cart.builder().customer(customer).items(new ArrayList<>()).build();
                    return cartRepository.save(newCart);
                });

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            existingItem.get().setQuantity(existingItem.get().getQuantity() + quantity);
        } else {
            CartItem item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public Cart updateCartItem(Long userId, Long cartItemId, int quantity) {
        Cart cart = getCart(userId);
        cart.getItems().stream()
                .filter(item -> item.getCartItemId().equals(cartItemId))
                .findFirst()
                .ifPresent(item -> item.setQuantity(quantity));
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getCartItemId().equals(cartItemId));
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
