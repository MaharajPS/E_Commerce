package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.request.SellerApplicationRequest;
import com.ecommerce.backend.entity.*;
import com.ecommerce.backend.entity.enums.*;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SellerApplicationService {

    private final SellerApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    @Transactional
    public SellerApplication apply(SellerApplicationRequest request) {
        SellerApplication application = SellerApplication.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .businessName(request.getBusinessName())
                .businessAddress(request.getBusinessAddress())
                .documentsUrl(request.getDocumentsUrl())
                .status(ApplicationStatus.PENDING)
                .build();
        return applicationRepository.save(application);
    }

    public List<SellerApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<SellerApplication> getApplicationsByStatus(ApplicationStatus status) {
        return applicationRepository.findByStatus(status);
    }

    @Transactional
    public SellerApplication approveApplication(Long applicationId, String adminRemarks,
                                                  PasswordEncoder passwordEncoder) {
        SellerApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        application.setStatus(ApplicationStatus.APPROVED);
        application.setAdminRemarks(adminRemarks);
        applicationRepository.save(application);

        // Auto-create seller account if email not already registered
        if (!userRepository.existsByEmail(application.getEmail())) {
            String tempPassword = UUID.randomUUID().toString().substring(0, 8);

            User user = User.builder()
                    .email(application.getEmail())
                    .password(passwordEncoder.encode(tempPassword))
                    .role(UserRole.ROLE_SELLER)
                    .build();
            user = userRepository.save(user);

            Seller seller = Seller.builder()
                    .user(user)
                    .storeName(application.getBusinessName())
                    .businessName(application.getBusinessName())
                    .businessAddress(application.getBusinessAddress())
                    .phone(application.getPhone())
                    .status(SellerStatus.ACTIVE)
                    .build();
            sellerRepository.save(seller);
        }

        return application;
    }

    @Transactional
    public SellerApplication rejectApplication(Long applicationId, String adminRemarks) {
        SellerApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        application.setStatus(ApplicationStatus.REJECTED);
        application.setAdminRemarks(adminRemarks);
        return applicationRepository.save(application);
    }

    public long countPending() {
        return applicationRepository.countByStatus(ApplicationStatus.PENDING);
    }
}
