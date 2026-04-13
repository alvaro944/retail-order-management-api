package com.alvaro.retail.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.alvaro.retail.common.exception.ProblemDetailFactory;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        ProblemDetailFactory problemDetailFactory,
        ObjectMapper objectMapper,
        JwtAuthenticationConverter jwtAuthenticationConverter
    ) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/health", "/swagger-ui/**", "/v3/api-docs/**", "/auth/login").permitAll()
                .requestMatchers("/auth/me").authenticated()
                .requestMatchers("/products/**", "/customers/**", "/inventories/**", "/orders/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                .authenticationEntryPoint((request, response, exception) -> {
                    String detail = isInvalidBearerToken(exception)
                        ? "The access token is invalid or expired"
                        : "Authentication is required to access this resource";
                    writeProblemDetail(
                        response,
                        objectMapper,
                        problemDetailFactory.create(HttpStatus.UNAUTHORIZED, detail, request.getRequestURI()),
                        HttpStatus.UNAUTHORIZED
                    );
                })
                .accessDeniedHandler((request, response, exception) -> {
                    writeProblemDetail(
                        response,
                        objectMapper,
                        problemDetailFactory.create(
                            HttpStatus.FORBIDDEN,
                            "You do not have permission to access this resource",
                            request.getRequestURI()
                        ),
                        HttpStatus.FORBIDDEN
                    );
                })
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    writeProblemDetail(
                        response,
                        objectMapper,
                        problemDetailFactory.create(
                            HttpStatus.UNAUTHORIZED,
                            "Authentication is required to access this resource",
                            request.getRequestURI()
                        ),
                        HttpStatus.UNAUTHORIZED
                    );
                })
                .accessDeniedHandler((request, response, exception) -> {
                    writeProblemDetail(
                        response,
                        objectMapper,
                        problemDetailFactory.create(
                            HttpStatus.FORBIDDEN,
                            "You do not have permission to access this resource",
                            request.getRequestURI()
                        ),
                        HttpStatus.FORBIDDEN
                    );
                })
            );

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of(HttpHeaders.WWW_AUTHENTICATE));
        configuration.setAllowCredentials(false);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    UserDetailsService userDetailsService(SecurityProperties securityProperties, PasswordEncoder passwordEncoder) {
        SecurityProperties.BootstrapUser bootstrapUser = securityProperties.getBootstrapUser();
        return new InMemoryUserDetailsManager(
            User.withUsername(bootstrapUser.getUsername())
                .password(passwordEncoder.encode(bootstrapUser.getPassword()))
                .roles(bootstrapUser.getRole())
                .build()
        );
    }

    @Bean
    AuthenticationManager authenticationManager(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    JwtEncoder jwtEncoder(SecurityProperties securityProperties) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(securityProperties)));
    }

    @Bean
    JwtDecoder jwtDecoder(SecurityProperties securityProperties) {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey(securityProperties))
            .macAlgorithm(MacAlgorithm.HS256)
            .build();

        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefaultWithIssuer(securityProperties.getJwt().getIssuer())
        );
        jwtDecoder.setJwtValidator(validator);
        return jwtDecoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter authenticationConverter = new JwtAuthenticationConverter();
        authenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return authenticationConverter;
    }

    private SecretKey jwtSecretKey(SecurityProperties securityProperties) {
        return new SecretKeySpec(
            securityProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8),
            "HmacSHA256"
        );
    }

    private boolean isInvalidBearerToken(Exception exception) {
        Throwable current = exception;
        while (current != null) {
            if (current instanceof InvalidBearerTokenException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private void writeProblemDetail(
        jakarta.servlet.http.HttpServletResponse response,
        ObjectMapper objectMapper,
        org.springframework.http.ProblemDetail problemDetail,
        HttpStatus status
    ) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        if (status == HttpStatus.UNAUTHORIZED) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        response.getWriter().write(objectMapper.writeValueAsString(problemDetail));
    }
}
