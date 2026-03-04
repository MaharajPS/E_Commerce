package com.ecommerce.backend.dto.response;



import com.ecommerce.backend.Entity.Enum.UserRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private String token;
    private String message;
}
