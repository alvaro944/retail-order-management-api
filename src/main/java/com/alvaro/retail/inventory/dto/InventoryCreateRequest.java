package com.alvaro.retail.inventory.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record InventoryCreateRequest(
    @NotNull(message = "productId is required")
    Long productId,

    @NotNull(message = "quantityAvailable is required")
    @PositiveOrZero(message = "quantityAvailable must be zero or greater")
    Integer quantityAvailable,

    @PositiveOrZero(message = "minimumStock must be zero or greater")
    Integer minimumStock
) {
}
