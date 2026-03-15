package com.ecommerce.backend.service;

import com.ecommerce.backend.entity.Address;
import com.ecommerce.backend.entity.Customer;
import com.ecommerce.backend.exception.ResourceNotFoundException;
import com.ecommerce.backend.repository.AddressRepository;
import com.ecommerce.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final CustomerRepository customerRepository;

    public List<Address> getCustomerAddresses(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return addressRepository.findByCustomerCustomerId(customer.getCustomerId());
    }

    public Address addAddress(Long userId, Address address) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        address.setCustomer(customer);
        return addressRepository.save(address);
    }

    public void deleteAddress(Long addressId) {
        addressRepository.deleteById(addressId);
    }
}
