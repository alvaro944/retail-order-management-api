package com.alvaro.retail.auth.controller;

import com.alvaro.retail.auth.dto.AuthLoginRequest;
import com.alvaro.retail.auth.dto.AuthTokenResponse;
import com.alvaro.retail.auth.dto.AuthenticatedUserResponse;
import com.alvaro.retail.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@Tag(name = "auth", description = "Authentication and JWT operations")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Login", description = "Authenticates the bootstrap user and returns a JWT bearer token.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "JWT issued",
            content = @Content(schema = @Schema(implementation = AuthTokenResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request payload",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Invalid username or password",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public AuthTokenResponse login(@Valid @RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Current authenticated user", description = "Returns the currently authenticated principal from a valid JWT.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Authenticated principal",
            content = @Content(schema = @Schema(implementation = AuthenticatedUserResponse.class))
        ),
        @ApiResponse(
            responseCode = "401",
            description = "Missing, invalid, or expired token",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "403",
            description = "Authenticated but forbidden",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public AuthenticatedUserResponse getCurrentUser(Authentication authentication) {
        return authService.getCurrentUser(authentication);
    }
}
