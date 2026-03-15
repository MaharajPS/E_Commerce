package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.request.OrderRequest;
import com.ecommerce.backend.dto.response.ApiResponse;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.dto.response.PaymentResponse;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.Wishlist;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.service.*;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CartService cartService;
    private final OrderService orderService;
    private final PaymentService paymentService;
    private final ReviewService reviewService;
    private final WishlistService wishlistService;
    private final CustomerRepository customerRepository;

    private Long getUserId(UserDetails userDetails) {
        return customerRepository.findByUserEmail(userDetails.getUsername())
                .map(c -> c.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    // Cart
    @GetMapping("/cart")
    public ResponseEntity<ApiResponse<Cart>> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched", cartService.getCart(getUserId(userDetails))));
    }

    @PostMapping("/cart/add")
    public ResponseEntity<ApiResponse<Cart>> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity) {
        return ResponseEntity.ok(ApiResponse.success("Added to cart",
                cartService.addToCart(getUserId(userDetails), productId, quantity)));
    }

    @PutMapping("/cart/item/{itemId}")
    public ResponseEntity<ApiResponse<Cart>> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.success("Cart updated",
                cartService.updateCartItem(getUserId(userDetails), itemId, quantity)));
    }

    @DeleteMapping("/cart/item/{itemId}")
    public ResponseEntity<ApiResponse<Cart>> removeCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.success("Item removed",
                cartService.removeFromCart(getUserId(userDetails), itemId)));
    }

    // Orders
    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody OrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order placed",
                orderService.placeOrder(getUserId(userDetails), request)));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched",
                orderService.getCustomerOrders(getUserId(userDetails))));
    }

    @PutMapping("/orders/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Order cancelled",
                orderService.cancelOrder(getUserId(userDetails), orderId)));
    }

    @PutMapping("/orders/{orderId}/return")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Return requested",
                orderService.requestReturn(getUserId(userDetails), orderId)));
    }

    @PutMapping("/orders/{orderId}/replace")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReplacement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("Replacement requested",
                orderService.requestReplacement(getUserId(userDetails), orderId)));
    }

    // Payments - Stripe
    @PostMapping("/payment/stripe/create-intent/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPaymentIntent(
            @PathVariable Long orderId) throws StripeException {
        return ResponseEntity.ok(ApiResponse.success("Payment intent created",
                paymentService.createStripePaymentIntent(orderId)));
    }

    @PostMapping("/payment/stripe/confirm/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed",
                paymentService.confirmPayment(orderId, body.get("paymentIntentId"))));
    }

    @PostMapping("/payment/cod/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> processCOD(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success("COD order confirmed",
                paymentService.processCOD(orderId)));
    }

    // Reviews
    @PostMapping("/reviews/{productId}")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId,
            @RequestParam int rating,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(ApiResponse.success("Review added",
                reviewService.addReview(getUserId(userDetails), productId, rating, comment)));
    }

    // Wishlist
    @GetMapping("/wishlist")
    public ResponseEntity<ApiResponse<List<Wishlist>>> getWishlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched",
                wishlistService.getWishlist(getUserId(userDetails))));
    }

    @PostMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Wishlist>> addToWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Added to wishlist",
                wishlistService.addToWishlist(getUserId(userDetails), productId)));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWishlist(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(getUserId(userDetails), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}
