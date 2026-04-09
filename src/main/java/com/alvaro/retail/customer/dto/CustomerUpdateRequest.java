package com.alvaro.retail.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerUpdateRequest(
    @NotBlank(message = "firstName is required")
    @Size(max = 80, message = "firstName must be at most 80 characters")
    String firstName,

    @NotBlank(message = "lastName is required")
    @Size(max = 120, message = "lastName must be at most 120 characters")
    String lastName,

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email address")
    @Size(max = 160, message = "email must be at most 160 characters")
    String email,

    @Size(max = 30, message = "phone must be at most 30 characters")
    String phone
) {
}
