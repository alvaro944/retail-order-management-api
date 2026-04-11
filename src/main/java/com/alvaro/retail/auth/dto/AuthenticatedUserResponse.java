package com.alvaro.retail.auth.dto;

import java.util.List;

public record AuthenticatedUserResponse(
    String username,
    List<String> roles
) {
}
