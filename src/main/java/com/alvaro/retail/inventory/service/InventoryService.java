package com.alvaro.retail.inventory.service;

import com.alvaro.retail.inventory.dto.InventoryAdjustmentRequest;
import com.alvaro.retail.inventory.dto.InventoryCreateRequest;
import com.alvaro.retail.inventory.dto.InventoryResponse;
import com.alvaro.retail.inventory.dto.InventoryUpdateRequest;
import java.util.List;

public interface InventoryService {

    InventoryResponse createInventory(InventoryCreateRequest request);

    List<InventoryResponse> getInventories();

    InventoryResponse getInventoryById(Long id);

    InventoryResponse getInventoryByProductId(Long productId);

    InventoryResponse updateInventory(Long id, InventoryUpdateRequest request);

    InventoryResponse adjustInventory(Long id, InventoryAdjustmentRequest request);
}
