package com.alvaro.retail.customer.dto;

import java.time.Instant;

public record CustomerResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    boolean active,
    Instant createdAt,
    Instant updatedAt
) {
}
