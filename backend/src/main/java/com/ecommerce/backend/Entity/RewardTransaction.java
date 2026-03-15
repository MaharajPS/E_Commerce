package com.ecommerce.backend.entity;

import com.ecommerce.backend.entity.enums.RewardTransactionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RewardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private RewardPoints rewardPoints;

    @Column(nullable = false)
    private Integer points;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RewardTransactionType transactionType;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
