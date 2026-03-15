package com.ecommerce.backend.dto.response;

import com.ecommerce.backend.entity.enums.PaymentMethod;
import com.ecommerce.backend.entity.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String clientSecret; // Stripe client secret for frontend
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private LocalDateTime paidAt;
}
