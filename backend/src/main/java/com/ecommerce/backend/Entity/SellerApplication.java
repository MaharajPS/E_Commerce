package com.ecommerce.backend.entity;

import com.ecommerce.backend.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "seller_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long applicationId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String businessName;

    private String businessAddress;
    private String documentsUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    private String adminRemarks;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
