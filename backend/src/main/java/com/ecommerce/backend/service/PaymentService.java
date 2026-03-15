package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.response.PaymentResponse;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.Payment;
import com.ecommerce.backend.entity.enums.OrderStatus;
import com.ecommerce.backend.entity.enums.PaymentMethod;
import com.ecommerce.backend.entity.enums.PaymentStatus;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.PaymentRepository;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.Wallet;
import com.ecommerce.backend.service.WalletService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final WalletService walletService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public PaymentResponse createStripePaymentIntent(Long orderId) throws StripeException {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getFinalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Order amount is zero, no payment required via Stripe.");
        }

        long amountInCents = order.getFinalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("inr")
                .putMetadata("orderId", String.valueOf(orderId))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = paymentRepository.findByOrderOrderId(orderId).orElse(
                Payment.builder().order(order).build()
        );
        payment.setPaymentMethod(PaymentMethod.STRIPE_TEST);
        payment.setStripePaymentIntentId(intent.getId());
        payment.setAmount(order.getTotalAmount());
        payment.setCurrency("inr");
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .orderId(orderId)
                .amount(order.getTotalAmount())
                .currency("inr")
                .clientSecret(intent.getClientSecret())
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Transactional
    public PaymentResponse confirmPayment(Long orderId, String paymentIntentId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = paymentRepository.findByOrderOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        payment.setTransactionId(paymentIntentId);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .orderId(orderId)
                .transactionId(paymentIntentId)
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(PaymentStatus.COMPLETED)
                .paidAt(payment.getPaidAt())
                .build();
    }

    @Transactional
    public PaymentResponse processCOD(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(PaymentMethod.COD)
                .amount(order.getTotalAmount())
                .currency("inr")
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        return PaymentResponse.builder()
                .orderId(orderId)
                .paymentMethod(PaymentMethod.COD)
                .amount(payment.getAmount())
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Transactional
    public PaymentResponse createWalletChargeIntent(Long userId, BigDecimal amount) throws StripeException {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("inr")
                .putMetadata("type", "WALLET_CHARGE")
                .putMetadata("customerId", String.valueOf(customer.getCustomerId()))
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Payment payment = Payment.builder()
                .customer(customer)
                .paymentMethod(PaymentMethod.STRIPE_TEST)
                .stripePaymentIntentId(intent.getId())
                .amount(amount)
                .currency("inr")
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .amount(amount)
                .currency("inr")
                .clientSecret(intent.getClientSecret())
                .status(PaymentStatus.PENDING)
                .build();
    }

    @Transactional
    public void confirmWalletCharge(String paymentIntentId) {
        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == PaymentStatus.COMPLETED) return;

        payment.setTransactionId(paymentIntentId);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        walletService.creditWallet(payment.getCustomer().getCustomerId(), payment.getAmount(), "DEPOSIT", payment.getPaymentId());
    }
}
