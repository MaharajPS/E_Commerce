package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "reward_points")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rewardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Customer customer;

    @Column(nullable = false)
    @Builder.Default
    private Integer pointsBalance = 0;

    @OneToMany(mappedBy = "rewardPoints", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<RewardTransaction> transactions;
}
