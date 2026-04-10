package com.alvaro.retail.order.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderResponse(
    Long id,
    OrderCustomerSummary customer,
    String status,
    BigDecimal totalAmount,
    List<OrderItemResponse> items,
    Instant createdAt,
    Instant updatedAt
) {
}
