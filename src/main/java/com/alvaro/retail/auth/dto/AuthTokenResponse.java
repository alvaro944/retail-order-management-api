package com.alvaro.retail.auth.dto;

import java.time.Instant;

public record AuthTokenResponse(
    String accessToken,
    String tokenType,
    Instant expiresAt
) {
}
