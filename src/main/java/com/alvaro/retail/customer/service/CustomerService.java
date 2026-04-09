package com.alvaro.retail.customer.service;

import com.alvaro.retail.customer.dto.CustomerCreateRequest;
import com.alvaro.retail.customer.dto.CustomerResponse;
import com.alvaro.retail.customer.dto.CustomerUpdateRequest;
import java.util.List;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerCreateRequest request);

    List<CustomerResponse> getCustomers();

    CustomerResponse getCustomerById(Long id);

    CustomerResponse updateCustomer(Long id, CustomerUpdateRequest request);

    void deleteCustomer(Long id);
}
