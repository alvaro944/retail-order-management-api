package com.alvaro.retail.common.controller;

import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/health")
    @ResponseStatus(HttpStatus.OK)
    public HealthResponse health() {
        return new HealthResponse("UP", "retail-order-management-api", Instant.now());
    }

    public record HealthResponse(String status, String service, Instant timestamp) {
    }
}
