package com.alvaro.retail.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Retail Order Management API",
        version = "v1",
        description = "REST API for managing products, customers, inventory, and orders in a retail modular monolith.",
        license = @License(name = "Portfolio project")
    )
)
public class OpenApiConfig {
}
