package com.ecommerce.backend;

import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.entity.enums.ProductStatus;
import com.ecommerce.backend.entity.enums.SellerStatus;
import com.ecommerce.backend.entity.enums.UserRole;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@SpringBootApplication
@Slf4j
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    CommandLineRunner init(UserRepository userRepository,
                           SuperAdminRepository superAdminRepository,
                           AdminRepository adminRepository,
                           SellerRepository sellerRepository,
                           CustomerRepository customerRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           CouponRepository couponRepository,
                           CartRepository cartRepository,
                           WalletRepository walletRepository,
                           RewardPointsRepository rewardPointsRepository,
                           PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Super Admin if not exists
            if (!userRepository.existsByEmail("superadmin@marketplace.com")) {
                User superUser = User.builder()
                        .email("superadmin@marketplace.com")
                        .password(passwordEncoder.encode("SuperAdmin@123"))
                        .role(UserRole.ROLE_SUPER_ADMIN)
                        .build();
                superUser = userRepository.save(superUser);

                SuperAdmin superAdmin = SuperAdmin.builder()
                        .user(superUser)
                        .name("Super Administrator")
                        .build();
                superAdminRepository.save(superAdmin);
                log.info("✅ Super Admin seeded: superadmin@marketplace.com / SuperAdmin@123");
            }

            // Seed default categories
            List<String> categories = List.of(
                "Electronics", "Fashion", "Home & Garden", "Sports & Outdoors",
                "Books", "Toys & Games", "Health & Beauty", "Automotive",
                "Food & Beverage", "Art & Crafts"
            );

            for (String cat : categories) {
                if (!categoryRepository.existsByName(cat)) {
                    categoryRepository.save(Category.builder()
                            .name(cat)
                            .description("Products in " + cat)
                            .build());
                }
            }
            log.info("✅ Default categories seeded");

            // Seed a sample Admin if not exists
            if (!userRepository.existsByEmail("admin@marketplace.com")) {
                User adminUser = User.builder()
                        .email("admin@marketplace.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .role(UserRole.ROLE_ADMIN)
                        .build();
                adminUser = userRepository.save(adminUser);

                Admin admin = Admin.builder()
                        .user(adminUser)
                        .name("System Administrator")
                        .phone("1234567890")
                        .build();
                adminRepository.save(admin);
                log.info("✅ Sample Admin seeded: admin@marketplace.com / Admin@123");
            }

            // Seed a sample Customer if not exists
            Customer customer;
            if (!userRepository.existsByEmail("customer@marketplace.com")) {
                User customerUser = User.builder()
                        .email("customer@marketplace.com")
                        .password(passwordEncoder.encode("Customer@123"))
                        .role(UserRole.ROLE_CUSTOMER)
                        .build();
                customerUser = userRepository.save(customerUser);

                customer = Customer.builder()
                        .user(customerUser)
                        .name("John Doe")
                        .phone("5554443333")
                        .address("789 Street, City, Country")
                        .build();
                customer = customerRepository.save(customer);
                log.info("✅ Sample Customer seeded: customer@marketplace.com / Customer@123");
            } else {
                customer = customerRepository.findByUserEmail("customer@marketplace.com").get();
            }

            // Ensure Cart, Wallet, and RewardPoints exist for the customer
            if (cartRepository.findByCustomerCustomerId(customer.getCustomerId()).isEmpty()) {
                cartRepository.save(Cart.builder().customer(customer).build());
                log.info("✅ Cart created for existing customer");
            }
            if (walletRepository.findByCustomerCustomerId(customer.getCustomerId()).isEmpty()) {
                walletRepository.save(Wallet.builder().customer(customer).build());
                log.info("✅ Wallet created for existing customer");
            }
            if (rewardPointsRepository.findByCustomerCustomerId(customer.getCustomerId()).isEmpty()) {
                rewardPointsRepository.save(RewardPoints.builder().customer(customer).build());
                log.info("✅ Reward points created for existing customer");
            }

            // Seed a sample Seller if not exists
            if (!userRepository.existsByEmail("seller@marketplace.com")) {
                User sellerUser = User.builder()
                        .email("seller@marketplace.com")
                        .password(passwordEncoder.encode("Seller@123"))
                        .role(UserRole.ROLE_SELLER)
                        .build();
                sellerUser = userRepository.save(sellerUser);

                Seller seller = Seller.builder()
                        .user(sellerUser)
                        .storeName("Urban Trends")
                        .phone("9876543210")
                        .businessAddress("123 Business Park, Tech City")
                        .status(SellerStatus.ACTIVE)
                        .build();
                seller = sellerRepository.save(seller);
                log.info("✅ Sample Seller seeded: seller@marketplace.com / Seller@123");

                // Seed some products for this seller
                Category electronics = categoryRepository.findByName("Electronics").orElse(null);
                Category fashion = categoryRepository.findByName("Fashion").orElse(null);

                if (electronics != null) {
                    productRepository.save(Product.builder()
                            .name("Premium Wireless Headphones")
                            .description("High-quality sound with noise cancellation.")
                            .price(new java.math.BigDecimal("199.99"))
                            .stock(50)
                            .status(ProductStatus.ACTIVE)
                            .category(electronics)
                            .seller(seller)
                            .build());
                    productRepository.save(Product.builder()
                            .name("Smart Fitness Watch")
                            .description("Track your health and workouts in real-time.")
                            .price(new java.math.BigDecimal("89.50"))
                            .stock(100)
                            .status(ProductStatus.ACTIVE)
                            .category(electronics)
                            .seller(seller)
                            .build());
                }

                if (fashion != null) {
                    productRepository.save(Product.builder()
                            .name("Classic Denims")
                            .description("Timeless style and comfort.")
                            .price(new java.math.BigDecimal("59.00"))
                            .stock(200)
                            .status(ProductStatus.ACTIVE)
                            .category(fashion)
                            .seller(seller)
                            .build());
                }
                log.info("✅ Sample products seeded");
            }

            // Seed default coupons
            if (couponRepository.count() == 0) {
                couponRepository.save(Coupon.builder()
                        .code("WELCOME10")
                        .discountType(com.ecommerce.backend.entity.enums.CouponDiscountType.PERCENTAGE)
                        .discountValue(new java.math.BigDecimal("10.00"))
                        .minimumOrderAmount(new java.math.BigDecimal("500.00"))
                        .expiryDate(java.time.LocalDateTime.now().plusMonths(6))
                        .usageLimit(100)
                        .usedCount(0)
                        .build());
                couponRepository.save(Coupon.builder()
                        .code("FLAT50")
                        .discountType(com.ecommerce.backend.entity.enums.CouponDiscountType.FLAT)
                        .discountValue(new java.math.BigDecimal("50.00"))
                        .minimumOrderAmount(new java.math.BigDecimal("1000.00"))
                        .expiryDate(java.time.LocalDateTime.now().plusMonths(6))
                        .usageLimit(100)
                        .usedCount(0)
                        .build());
                log.info("✅ Default coupons seeded");
            }
        };
    }
}
