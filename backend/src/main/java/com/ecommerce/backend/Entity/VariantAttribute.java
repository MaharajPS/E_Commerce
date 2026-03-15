package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variant_attributes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantAttribute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attributeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private ProductVariant variant;

    @Column(nullable = false)
    private String attributeName; // e.g., Size, Color

    @Column(nullable = false)
    private String attributeValue; // e.g., M, Red
}
