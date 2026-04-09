package com.alvaro.retail.inventory.controller;

import com.alvaro.retail.inventory.dto.InventoryAdjustmentRequest;
import com.alvaro.retail.inventory.dto.InventoryCreateRequest;
import com.alvaro.retail.inventory.dto.InventoryResponse;
import com.alvaro.retail.inventory.dto.InventoryUpdateRequest;
import com.alvaro.retail.inventory.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/inventories")
    @ResponseStatus(HttpStatus.CREATED)
    public InventoryResponse createInventory(@Valid @RequestBody InventoryCreateRequest request) {
        return inventoryService.createInventory(request);
    }

    @GetMapping("/inventories")
    public List<InventoryResponse> getInventories() {
        return inventoryService.getInventories();
    }

    @GetMapping("/inventories/{id}")
    public InventoryResponse getInventoryById(@PathVariable Long id) {
        return inventoryService.getInventoryById(id);
    }

    @GetMapping("/products/{productId}/inventory")
    public InventoryResponse getInventoryByProductId(@PathVariable Long productId) {
        return inventoryService.getInventoryByProductId(productId);
    }

    @PutMapping("/inventories/{id}")
    public InventoryResponse updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryUpdateRequest request) {
        return inventoryService.updateInventory(id, request);
    }

    @PatchMapping("/inventories/{id}/adjust")
    public InventoryResponse adjustInventory(@PathVariable Long id, @Valid @RequestBody InventoryAdjustmentRequest request) {
        return inventoryService.adjustInventory(id, request);
    }
}
