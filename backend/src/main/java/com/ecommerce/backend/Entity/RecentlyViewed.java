package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recently_viewed")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecentlyViewed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long viewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime viewedAt;
}
