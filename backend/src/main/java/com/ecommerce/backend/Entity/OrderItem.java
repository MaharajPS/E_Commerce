package com.ecommerce.backend.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
<<<<<<< HEAD
    private ProductEntity product;
=======
    private Product product;
>>>>>>> 5a21c8521f1673adfabc557e60a97291df264969

    @Column(nullable = false)
    private Integer quantity;

<<<<<<< HEAD
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase;

}
=======
    @Column(name = "price_at_purchase", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtPurchase;
}
>>>>>>> 5a21c8521f1673adfabc557e60a97291df264969
