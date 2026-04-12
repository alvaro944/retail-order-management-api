package com.alvaro.retail.auth.service;

import com.alvaro.retail.auth.dto.AuthTokenResponse;
import com.alvaro.retail.common.config.SecurityProperties;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @Mock
    private JwtEncoder jwtEncoder;

    @Captor
    private ArgumentCaptor<JwtEncoderParameters> encoderParametersCaptor;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        SecurityProperties securityProperties = new SecurityProperties();
        securityProperties.getJwt().setSecret("test-secret-key-for-jwt-phase-10-123456");
        securityProperties.getJwt().setIssuer("retail-order-management-api-test");
        securityProperties.getJwt().setExpirationMinutes(90);
        jwtService = new JwtService(jwtEncoder, securityProperties);
    }

    @Test
    void issueTokenBuildsBearerResponseUsingConfiguredClaims() {
        Instant issuedAt = Instant.parse("2026-04-12T00:00:00Z");
        Instant expiresAt = issuedAt.plus(Duration.ofMinutes(90));
        Jwt encodedJwt = new Jwt(
            "signed-token",
            issuedAt,
            expiresAt,
            Map.of("alg", "HS256"),
            Map.of("sub", "admin", "roles", List.of("ADMIN", "USER"))
        );
        when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenReturn(encodedJwt);

        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
            "admin",
            "ignored",
            List.of(
                new SimpleGrantedAuthority("ROLE_ADMIN"),
                new SimpleGrantedAuthority("ROLE_USER")
            )
        );

        AuthTokenResponse response = jwtService.issueToken(authentication);

        verify(jwtEncoder).encode(encoderParametersCaptor.capture());
        JwtClaimsSet claims = encoderParametersCaptor.getValue().getClaims();

        assertEquals("signed-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(claims.getExpiresAt(), response.expiresAt());
        assertEquals("retail-order-management-api-test", claims.getClaims().get("iss"));
        assertEquals("admin", claims.getClaims().get("sub"));
        assertEquals(List.of("ADMIN", "USER"), claims.getClaims().get("roles"));
        assertEquals(Duration.ofMinutes(90), Duration.between(claims.getIssuedAt(), claims.getExpiresAt()));
        assertEquals("HS256", encoderParametersCaptor.getValue().getJwsHeader().getAlgorithm().getName());
    }
}
