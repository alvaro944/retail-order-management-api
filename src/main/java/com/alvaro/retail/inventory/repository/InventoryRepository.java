package com.alvaro.retail.inventory.repository;

import com.alvaro.retail.inventory.entity.Inventory;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByIdAndProductActiveTrue(Long id);

    Optional<Inventory> findByProductIdAndProductActiveTrue(Long productId);

    List<Inventory> findAllByProductActiveTrueOrderByProductNameAsc();

    boolean existsByProductId(Long productId);
}
