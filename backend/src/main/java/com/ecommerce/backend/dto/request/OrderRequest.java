package com.ecommerce.backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class OrderRequest {
    private String shippingAddress;
    private String paymentMethod; // STRIPE_TEST or COD
    private List<OrderItemRequest> items;

    // Platform enhancements
    private String couponCode;
    private Boolean useWallet;
    private Boolean useRewardPoints;
    private Integer rewardPointsToRedeem;
    private Boolean protectPromise;
}
