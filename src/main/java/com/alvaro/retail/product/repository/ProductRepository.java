package com.alvaro.retail.product.repository;

import com.alvaro.retail.product.entity.Product;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByActiveTrueOrderByNameAsc();

    Optional<Product> findByIdAndActiveTrue(Long id);

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);
}
