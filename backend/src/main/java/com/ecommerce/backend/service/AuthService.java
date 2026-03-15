package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.LoginRequest;
import com.ecommerce.backend.dto.request.RegisterRequest;
import com.ecommerce.backend.dto.response.AuthResponse;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.entity.enums.UserRole;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.exception.UserAlreadyExistsException;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.CustomerRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.repository.WalletRepository;
import com.ecommerce.backend.repository.RewardPointsRepository;
import com.ecommerce.backend.entity.Wallet;
import com.ecommerce.backend.entity.RewardPoints;
import com.ecommerce.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final CartRepository cartRepository;
    private final WalletRepository walletRepository;
    private final RewardPointsRepository rewardPointsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ROLE_CUSTOMER)
                .build();
        user = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(user)
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();
        customer = customerRepository.save(customer);

        // Create cart for customer
        Cart cart = Cart.builder().customer(customer).build();
        cartRepository.save(cart);

        // Initialize wallet and reward points
        Wallet wallet = Wallet.builder().customer(customer).build();
        walletRepository.save(wallet);

        RewardPoints rewardPoints = RewardPoints.builder().customer(customer).build();
        rewardPointsRepository.save(rewardPoints);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .email(user.getEmail())
                .name(customer.getName())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getId(), user.getRole().name());

        String name = resolveDisplayName(user);

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .userId(user.getId())
                .email(user.getEmail())
                .name(name)
                .build();
    }

    private String resolveDisplayName(User user) {
        return switch (user.getRole()) {
            case ROLE_CUSTOMER -> user.getCustomer() != null ? user.getCustomer().getName() : user.getEmail();
            case ROLE_SELLER -> user.getSeller() != null ? user.getSeller().getStoreName() : user.getEmail();
            case ROLE_ADMIN -> user.getAdmin() != null ? user.getAdmin().getName() : user.getEmail();
            case ROLE_SUPER_ADMIN -> user.getSuperAdmin() != null ? user.getSuperAdmin().getName() : user.getEmail();
        };
    }
}
