package com.alvaro.retail.auth.service;

import com.alvaro.retail.auth.dto.AuthLoginRequest;
import com.alvaro.retail.auth.dto.AuthenticatedUserResponse;
import com.alvaro.retail.common.exception.UnauthorizedException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginWrapsAuthenticationExceptionAsUnauthorizedException() {
        AuthLoginRequest request = new AuthLoginRequest("admin", "wrong-password");
        when(authenticationManager.authenticate(any(Authentication.class)))
            .thenThrow(new BadCredentialsException("Bad credentials"));

        UnauthorizedException exception = assertThrows(UnauthorizedException.class, () -> authService.login(request));

        assertEquals("Invalid username or password", exception.getMessage());
        verify(jwtService, never()).issueToken(any(Authentication.class));
    }

    @Test
    void getCurrentUserStripsRolePrefixAndSortsRoles() {
        Authentication authentication = UsernamePasswordAuthenticationToken.authenticated(
            "admin",
            "ignored",
            List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("MANAGER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
            )
        );

        AuthenticatedUserResponse response = authService.getCurrentUser(authentication);

        assertEquals("admin", response.username());
        assertEquals(List.of("ADMIN", "MANAGER", "USER"), response.roles());
    }
}
