package com.alvaro.retail.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderItemRequest(
    @NotNull(message = "productId is required")
    Long productId,

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be greater than zero")
    Integer quantity
) {
}
