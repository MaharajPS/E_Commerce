package com.ecommerce.backend.dto.response;

import com.ecommerce.backend.entity.enums.OrderStatus;
import com.ecommerce.backend.entity.enums.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long orderId;
    private Long customerId;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal deliveryCharge;
    private BigDecimal protectPromiseFee;
    private BigDecimal finalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private PaymentResponse payment;
    private LocalDateTime createdAt;
}
