package com.alvaro.retail.order.repository;

import com.alvaro.retail.order.entity.Order;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    List<Order> findAllByOrderByCreatedAtDescIdDesc();
}
