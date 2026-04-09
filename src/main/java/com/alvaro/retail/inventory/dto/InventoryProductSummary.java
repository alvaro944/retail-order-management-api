package com.alvaro.retail.inventory.dto;

public record InventoryProductSummary(
    Long id,
    String name,
    String sku
) {
}
