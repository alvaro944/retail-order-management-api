package com.alvaro.retail.inventory.service;

import com.alvaro.retail.common.exception.BusinessConflictException;
import com.alvaro.retail.common.exception.ResourceNotFoundException;
import com.alvaro.retail.inventory.dto.InventoryAdjustmentRequest;
import com.alvaro.retail.inventory.dto.InventoryAdjustmentType;
import com.alvaro.retail.inventory.dto.InventoryCreateRequest;
import com.alvaro.retail.inventory.dto.InventoryProductSummary;
import com.alvaro.retail.inventory.dto.InventoryResponse;
import com.alvaro.retail.inventory.dto.InventoryUpdateRequest;
import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryServiceImpl(InventoryRepository inventoryRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public InventoryResponse createInventory(InventoryCreateRequest request) {
        Product product = getActiveProduct(request.productId());
        ensureInventoryDoesNotExist(product.getId());

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantityAvailable(request.quantityAvailable());
        inventory.setMinimumStock(normalizeMinimumStock(request.minimumStock()));

        Inventory savedInventory = inventoryRepository.saveAndFlush(inventory);
        return toResponse(savedInventory);
    }

    @Override
    public List<InventoryResponse> getInventories() {
        return inventoryRepository.findAllByProductActiveTrueOrderByProductNameAsc().stream()
            .map(this::toResponse)
            .toList();
    }

    @Override
    public InventoryResponse getInventoryById(Long id) {
        return toResponse(getActiveInventory(id));
    }

    @Override
    public InventoryResponse getInventoryByProductId(Long productId) {
        return toResponse(inventoryRepository.findByProductIdAndProductActiveTrue(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory for product with id " + productId + " was not found")));
    }

    @Override
    @Transactional
    public InventoryResponse updateInventory(Long id, InventoryUpdateRequest request) {
        Inventory inventory = getActiveInventory(id);
        inventory.setMinimumStock(request.minimumStock());
        inventory.setUpdatedAt(Instant.now());

        Inventory updatedInventory = inventoryRepository.saveAndFlush(inventory);
        return toResponse(updatedInventory);
    }

    @Override
    @Transactional
    public InventoryResponse adjustInventory(Long id, InventoryAdjustmentRequest request) {
        Inventory inventory = getActiveInventory(id);

        if (request.type() == InventoryAdjustmentType.INCREASE) {
            inventory.setQuantityAvailable(inventory.getQuantityAvailable() + request.quantity());
        } else {
            int updatedQuantity = inventory.getQuantityAvailable() - request.quantity();
            if (updatedQuantity < 0) {
                throw new BusinessConflictException("Inventory with id " + id + " cannot be reduced below zero");
            }
            inventory.setQuantityAvailable(updatedQuantity);
        }
        inventory.setUpdatedAt(Instant.now());

        Inventory updatedInventory = inventoryRepository.saveAndFlush(inventory);
        return toResponse(updatedInventory);
    }

    private Product getActiveProduct(Long productId) {
        return productRepository.findByIdAndActiveTrue(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product with id " + productId + " was not found"));
    }

    private Inventory getActiveInventory(Long id) {
        return inventoryRepository.findByIdAndProductActiveTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException("Inventory with id " + id + " was not found"));
    }

    private void ensureInventoryDoesNotExist(Long productId) {
        if (inventoryRepository.existsByProductId(productId)) {
            throw new BusinessConflictException("Inventory for product with id " + productId + " already exists");
        }
    }

    private int normalizeMinimumStock(Integer minimumStock) {
        return minimumStock == null ? 0 : minimumStock;
    }

    private InventoryResponse toResponse(Inventory inventory) {
        Product product = inventory.getProduct();
        return new InventoryResponse(
            inventory.getId(),
            new InventoryProductSummary(product.getId(), product.getName(), product.getSku()),
            inventory.getQuantityAvailable(),
            inventory.getMinimumStock(),
            inventory.getCreatedAt(),
            inventory.getUpdatedAt()
        );
    }
}
