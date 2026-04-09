package com.alvaro.retail.customer.repository;

import com.alvaro.retail.customer.entity.Customer;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByIdAndActiveTrue(Long id);

    List<Customer> findAllByActiveTrueOrderByLastNameAscFirstNameAscIdAsc();

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);
}
