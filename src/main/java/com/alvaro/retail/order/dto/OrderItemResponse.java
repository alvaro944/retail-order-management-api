package com.alvaro.retail.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
    Long id,
    Long productId,
    String productName,
    String productSku,
    BigDecimal unitPrice,
    Integer quantity,
    BigDecimal subtotal
) {
}
