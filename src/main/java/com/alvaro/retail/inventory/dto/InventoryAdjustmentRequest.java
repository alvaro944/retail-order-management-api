package com.alvaro.retail.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InventoryAdjustmentRequest(
    @NotNull(message = "type is required")
    InventoryAdjustmentType type,

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be greater than zero")
    Integer quantity
) {
}
