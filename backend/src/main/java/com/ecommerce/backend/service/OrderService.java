package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.response.OrderItemResponse;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.dto.response.PaymentResponse;
import com.ecommerce.backend.dto.request.OrderRequest;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.entity.enums.*;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import com.ecommerce.backend.service.WalletService;
import com.ecommerce.backend.service.RewardPointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final WalletService walletService;
    private final RewardPointsService rewardPointsService;
    private final CouponService couponService;

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (var itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .price(product.getPrice())
                    .build();
            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        BigDecimal itemsTotal = total;
        BigDecimal discountAmount = BigDecimal.ZERO;

        // Apply Coupon
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            Map<String, Object> validation = couponService.validateCoupon(request.getCouponCode(), itemsTotal);
            if ((Boolean) validation.get("valid")) {
                discountAmount = discountAmount.add((BigDecimal) validation.get("discount"));
            }
        }

        // Apply Reward Points (100 points = ₹10)
        if (Boolean.TRUE.equals(request.getUseRewardPoints()) && request.getRewardPointsToRedeem() != null && request.getRewardPointsToRedeem() >= 100) {
            int redeemableValue = (request.getRewardPointsToRedeem() / 100) * 10;
            discountAmount = discountAmount.add(BigDecimal.valueOf(redeemableValue));
            rewardPointsService.redeemPoints(customer.getCustomerId(), request.getRewardPointsToRedeem(), "ORDER", null);
        }

        BigDecimal afterDiscount = itemsTotal.subtract(discountAmount);
        if (afterDiscount.compareTo(BigDecimal.ZERO) < 0) afterDiscount = BigDecimal.ZERO;

        BigDecimal deliveryCharge = afterDiscount.compareTo(BigDecimal.valueOf(500)) < 0 ? BigDecimal.valueOf(40) : BigDecimal.ZERO;
        BigDecimal protectPromiseFee = Boolean.TRUE.equals(request.getProtectPromise()) ? BigDecimal.valueOf(29) : BigDecimal.ZERO;
        
        BigDecimal finalAmount = afterDiscount.add(deliveryCharge).add(protectPromiseFee);

        // Apply Wallet
        if (Boolean.TRUE.equals(request.getUseWallet())) {
            Wallet wallet = walletService.getWalletByUserId(userId);
            if (wallet.getBalance().compareTo(finalAmount) >= 0) {
                walletService.debitWallet(customer.getCustomerId(), finalAmount, "ORDER", null);
                finalAmount = BigDecimal.ZERO;
            } else if (wallet.getBalance().compareTo(BigDecimal.ZERO) > 0) {
                finalAmount = finalAmount.subtract(wallet.getBalance());
                walletService.debitWallet(customer.getCustomerId(), wallet.getBalance(), "ORDER", null);
            }
        }

        Order order = Order.builder()
                .customer(customer)
                .totalAmount(itemsTotal)
                .discountAmount(discountAmount)
                .deliveryCharge(deliveryCharge)
                .protectPromiseFee(protectPromiseFee)
                .finalAmount(finalAmount)
                .status(finalAmount.compareTo(BigDecimal.ZERO) <= 0 ? OrderStatus.CONFIRMED : OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .items(items)
                .build();

        items.forEach(item -> item.setOrder(order));
        Order savedOrder = orderRepository.save(order);

        // Consume coupon
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            couponService.consumeCoupon(request.getCouponCode());
        }

        // Clear cart after order placed
        cartRepository.findByCustomerUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });

        return toResponse(savedOrder);
    }

    public List<OrderResponse> getCustomerOrders(Long userId) {
        return orderRepository.findByCustomerUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getSellerOrders(Long sellerId) {
        return orderRepository.findOrdersBySellerId(sellerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        // Admin approves return -> Refund to wallet
        if (newStatus == OrderStatus.RETURNED && order.getStatus() != OrderStatus.RETURNED) {
            walletService.creditWallet(order.getCustomer().getCustomerId(), order.getFinalAmount(), "REFUND", order.getOrderId());
            
            // Restore Stock
            for (OrderItem item : order.getItems()) {
                if (item.getVariant() != null) {
                    item.getVariant().setStock(item.getVariant().getStock() + item.getQuantity());
                } else {
                    item.getProduct().setStock(item.getProduct().getStock() + item.getQuantity());
                }
            }
        }

        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized to cancel this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Order cannot be cancelled in status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore Stock
        for (OrderItem item : order.getItems()) {
            if (item.getVariant() != null) {
                item.getVariant().setStock(item.getVariant().getStock() + item.getQuantity());
            } else {
                item.getProduct().setStock(item.getProduct().getStock() + item.getQuantity());
            }
        }

        // Refund to Wallet
        if (order.getFinalAmount().compareTo(BigDecimal.ZERO) == 0 || order.getPayment() != null) {
            walletService.creditWallet(order.getCustomer().getCustomerId(), order.getFinalAmount(), "REFUND", order.getOrderId());
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse requestReturn(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Order must be delivered to request return");
        }

        if (order.getCreatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Return period (7 days) has expired");
        }

        order.setStatus(OrderStatus.RETURN_REQUESTED);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse requestReplacement(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getUser().getId().equals(userId)) {
            throw new SecurityException("Not authorized");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Order must be delivered to request replacement");
        }

        if (order.getCreatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Replacement period (7 days) has expired");
        }

        order.setStatus(OrderStatus.REPLACEMENT_REQUESTED);
        return toResponse(orderRepository.save(order));
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .orderItemId(item.getOrderItemId())
                        .productId(item.getProduct().getProductId())
                        .productName(item.getProduct().getName())
                        .productImage(item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()
                                ? item.getProduct().getImages().stream()
                                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                                    .map(ProductImage::getImageUrl)
                                    .findFirst()
                                    .orElse(item.getProduct().getImages().get(0).getImageUrl())
                                : null)
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList())
                : List.of();

        PaymentResponse paymentResponse = null;
        if (order.getPayment() != null) {
            Payment p = order.getPayment();
            paymentResponse = PaymentResponse.builder()
                    .paymentId(p.getPaymentId())
                    .orderId(order.getOrderId())
                    .paymentMethod(p.getPaymentMethod())
                    .transactionId(p.getTransactionId())
                    .amount(p.getAmount())
                    .currency(p.getCurrency())
                    .status(p.getStatus())
                    .paidAt(p.getPaidAt())
                    .build();
        }

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .customerId(order.getCustomer().getCustomerId())
                .customerName(order.getCustomer().getName())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .deliveryCharge(order.getDeliveryCharge())
                .protectPromiseFee(order.getProtectPromiseFee())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPayment() != null ? order.getPayment().getPaymentMethod().name() : "COD")
                .items(itemResponses)
                .payment(paymentResponse)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
