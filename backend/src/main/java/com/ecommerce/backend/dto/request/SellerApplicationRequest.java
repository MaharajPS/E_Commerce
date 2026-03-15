package com.ecommerce.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class SellerApplicationRequest {
    @NotBlank
    private String name;
    @NotBlank @Email
    private String email;
    private String phone;
    @NotBlank
    private String businessName;
    private String businessAddress;
    private String documentsUrl;
}
