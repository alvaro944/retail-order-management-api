package com.alvaro.retail.auth.service;

import com.alvaro.retail.auth.dto.AuthLoginRequest;
import com.alvaro.retail.auth.dto.AuthTokenResponse;
import com.alvaro.retail.auth.dto.AuthenticatedUserResponse;
import com.alvaro.retail.common.exception.UnauthorizedException;
import java.util.List;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    public AuthTokenResponse login(AuthLoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password())
            );
            return jwtService.issueToken(authentication);
        } catch (AuthenticationException exception) {
            throw new UnauthorizedException("Invalid username or password");
        }
    }

    public AuthenticatedUserResponse getCurrentUser(Authentication authentication) {
        List<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(this::stripRolePrefix)
            .sorted()
            .toList();

        return new AuthenticatedUserResponse(authentication.getName(), roles);
    }

    private String stripRolePrefix(String authority) {
        return authority.startsWith("ROLE_") ? authority.substring(5) : authority;
    }
}
