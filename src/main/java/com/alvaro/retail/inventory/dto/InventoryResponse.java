package com.alvaro.retail.inventory.dto;

import java.time.Instant;

public record InventoryResponse(
    Long id,
    InventoryProductSummary product,
    Integer quantityAvailable,
    Integer minimumStock,
    Instant createdAt,
    Instant updatedAt
) {
}
