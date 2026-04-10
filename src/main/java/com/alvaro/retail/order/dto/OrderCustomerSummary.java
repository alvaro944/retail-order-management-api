package com.alvaro.retail.order.dto;

public record OrderCustomerSummary(
    Long id,
    String firstName,
    String lastName,
    String email
) {
}
