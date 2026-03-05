package com.ecommerce.backend.Interceptor;

import com.ecommerce.backend.Entity.Enum.UserRole;
import com.ecommerce.backend.Entity.User;
import com.ecommerce.backend.Repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        String requestURI = request.getRequestURI();
        
        // Public endpoints
        if (requestURI.startsWith("/api/auth/") || 
            (requestURI.startsWith("/api/products") && "GET".equalsIgnoreCase(request.getMethod())) ||
            requestURI.contains("/swagger-ui/") ||
            requestURI.contains("/v3/api-docs")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Long userId = Long.parseLong(token);
                
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Invalid token: user not found"));
                
                request.setAttribute("userId", userId);
                
                // Role checks
                boolean requiresAdmin = false;
                if (requestURI.startsWith("/api/analytics")) {
                    requiresAdmin = true;
                } else if (requestURI.equals("/api/users") && "GET".equalsIgnoreCase(request.getMethod())) {
                    requiresAdmin = true;
                } else if (requestURI.startsWith("/api/products") && ! "GET".equalsIgnoreCase(request.getMethod())) {
                    requiresAdmin = true;
                } else if (requestURI.equals("/api/orders") && "GET".equalsIgnoreCase(request.getMethod())) {
                    requiresAdmin = true;
                } else if (requestURI.contains("/confirm") || requestURI.contains("/ship") || requestURI.contains("/deliver") || requestURI.endsWith("/admin")) {
                    requiresAdmin = true;
                }

                if (requiresAdmin && user.getRole() != UserRole.ADMIN) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("Access denied: ADMIN only");
                    return false;
                }
                
                return true;
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid token format");
                return false;
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Unauthorized: " + e.getMessage());
                return false;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Authorization header missing or invalid");
        return false;
    }
}
