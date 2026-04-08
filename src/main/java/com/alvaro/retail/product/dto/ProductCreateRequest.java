package com.alvaro.retail.product.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductCreateRequest(
    @NotBlank(message = "name is required")
    @Size(max = 120, message = "name must be at most 120 characters")
    String name,

    @Size(max = 500, message = "description must be at most 500 characters")
    String description,

    @NotNull(message = "price is required")
    @Positive(message = "price must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "price must have up to 10 integer digits and 2 decimal places")
    BigDecimal price,

    @NotBlank(message = "sku is required")
    @Size(max = 64, message = "sku must be at most 64 characters")
    String sku
) {
}
