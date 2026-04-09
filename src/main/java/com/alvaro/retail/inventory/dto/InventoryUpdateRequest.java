package com.alvaro.retail.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record InventoryUpdateRequest(
    @NotNull(message = "minimumStock is required")
    @PositiveOrZero(message = "minimumStock must be zero or greater")
    Integer minimumStock
) {
}
