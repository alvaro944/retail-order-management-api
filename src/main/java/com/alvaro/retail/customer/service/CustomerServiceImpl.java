package com.alvaro.retail.customer.service;

import com.alvaro.retail.common.exception.DuplicateResourceException;
import com.alvaro.retail.common.exception.ResourceNotFoundException;
import com.alvaro.retail.customer.dto.CustomerCreateRequest;
import com.alvaro.retail.customer.dto.CustomerResponse;
import com.alvaro.retail.customer.dto.CustomerUpdateRequest;
import com.alvaro.retail.customer.entity.Customer;
import com.alvaro.retail.customer.repository.CustomerRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        ensureEmailIsUnique(normalizedEmail);

        Customer customer = new Customer();
        applyChanges(customer, request.firstName(), request.lastName(), normalizedEmail, request.phone());

        Customer savedCustomer = customerRepository.saveAndFlush(customer);
        return toResponse(savedCustomer);
    }

    @Override
    public List<CustomerResponse> getCustomers() {
        return customerRepository.findAllByActiveTrueOrderByLastNameAscFirstNameAscIdAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        return toResponse(getActiveCustomer(id));
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerUpdateRequest request) {
        Customer customer = getActiveCustomer(id);
        String normalizedEmail = normalizeEmail(request.email());

        ensureEmailIsUniqueForUpdate(normalizedEmail, id);
        applyChanges(customer, request.firstName(), request.lastName(), normalizedEmail, request.phone());

        Customer updatedCustomer = customerRepository.saveAndFlush(customer);
        return toResponse(updatedCustomer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = getActiveCustomer(id);
        customer.setActive(false);
        customerRepository.saveAndFlush(customer);
    }

    private Customer getActiveCustomer(Long id) {
        return customerRepository.findByIdAndActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Customer with id " + id + " was not found"));
    }

    private void ensureEmailIsUnique(String email) {
        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Customer with email " + email + " already exists");
        }
    }

    private void ensureEmailIsUniqueForUpdate(String email, Long id) {
        if (customerRepository.existsByEmailAndIdNot(email, id)) {
            throw new DuplicateResourceException("Customer with email " + email + " already exists");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private void applyChanges(Customer customer, String firstName, String lastName, String email, String phone) {
        customer.setFirstName(firstName.trim());
        customer.setLastName(lastName.trim());
        customer.setEmail(email);
        customer.setPhone(phone == null ? null : phone.trim());
    }

    private CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getEmail(),
            customer.getPhone(),
            customer.isActive(),
            customer.getCreatedAt(),
            customer.getUpdatedAt()
        );
    }
}
