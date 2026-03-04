package com.ecommerce.backend.Services;


import com.ecommerce.backend.dto.response.OrderItemResponse;
import com.ecommerce.backend.dto.response.OrderResponse;
import com.ecommerce.backend.Exception.BusinessRuleViolationException;
import com.ecommerce.backend.Exception.OrderNotFoundException;
import com.ecommerce.backend.Entity.Order;
import com.ecommerce.backend.Entity.OrderItem;
import com.ecommerce.backend.Entity.Enum.OrderStatus;
import com.ecommerce.backend.Repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderStatusService {

    private final OrderRepository orderRepository;
    private final ProductService productService;

    public OrderStatusService(OrderRepository orderRepository, ProductService productService) {
        this.orderRepository = orderRepository;
        this.productService = productService;
    }

    @Transactional
    public OrderResponse confirmOrder(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new OrderNotFoundException("Order", "id", id));

        if (!order.canConfirm()) {
            throw new BusinessRuleViolationException(
                "Order cannot be confirmed. Current status: " + order.getStatus());
        }

        // Reduce stock for each item
        for (OrderItem item : order.getOrderItems()) {
            productService.reduceStock(item.getProduct().getId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CONFIRMED);
        Order confirmedOrder = orderRepository.save(order);

        return toOrderResponse(confirmedOrder);
    }

    @Transactional
    public OrderResponse shipOrder(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new OrderNotFoundException("Order", "id", id));

        if (!order.canShip()) {
            throw new BusinessRuleViolationException(
                "Order cannot be shipped. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.SHIPPED);
        Order shippedOrder = orderRepository.save(order);

        return toOrderResponse(shippedOrder);
    }

    @Transactional
    public OrderResponse deliverOrder(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new OrderNotFoundException("Order", "id", id));

        if (!order.canDeliver()) {
            throw new BusinessRuleViolationException(
                "Order cannot be delivered. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.DELIVERED);
        Order deliveredOrder = orderRepository.save(order);

        return toOrderResponse(deliveredOrder);
    }

    public List<OrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .subtotal(item.getPriceAtPurchase().multiply(
                            java.math.BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemResponses)
                .build();
    }
}