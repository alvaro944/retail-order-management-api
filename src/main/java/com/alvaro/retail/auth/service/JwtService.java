package com.alvaro.retail.auth.service;

import com.alvaro.retail.auth.dto.AuthTokenResponse;
import com.alvaro.retail.common.config.SecurityProperties;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final SecurityProperties securityProperties;

    public JwtService(JwtEncoder jwtEncoder, SecurityProperties securityProperties) {
        this.jwtEncoder = jwtEncoder;
        this.securityProperties = securityProperties;
    }

    public AuthTokenResponse issueToken(Authentication authentication) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(securityProperties.getJwt().getExpirationMinutes(), ChronoUnit.MINUTES);
        List<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(this::stripRolePrefix)
            .toList();

        JwtClaimsSet claimsSet = JwtClaimsSet.builder()
            .issuer(securityProperties.getJwt().getIssuer())
            .issuedAt(issuedAt)
            .expiresAt(expiresAt)
            .subject(authentication.getName())
            .claim("roles", roles)
            .build();

        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();
        String tokenValue = jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claimsSet)).getTokenValue();
        return new AuthTokenResponse(tokenValue, "Bearer", expiresAt);
    }

    private String stripRolePrefix(String authority) {
        return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
    }
}
