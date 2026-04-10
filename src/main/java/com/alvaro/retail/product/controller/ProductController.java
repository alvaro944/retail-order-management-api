package com.alvaro.retail.product.controller;

import com.alvaro.retail.product.dto.ProductCreateRequest;
import com.alvaro.retail.product.dto.ProductResponse;
import com.alvaro.retail.product.dto.ProductUpdateRequest;
import com.alvaro.retail.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ProblemDetail;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@Tag(name = "product", description = "Product catalog operations")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create product", description = "Creates a new active product in the catalog.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Product created",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request payload",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Product SKU already exists",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public ProductResponse createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return productService.createProduct(request);
    }

    @GetMapping
    @Operation(summary = "List products", description = "Returns active products ordered by name.")
    @ApiResponse(
        responseCode = "200",
        description = "Product list",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProductResponse.class)))
    )
    public List<ProductResponse> getProducts() {
        return productService.getProducts();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id", description = "Returns one active product by its identifier.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product found",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product was not found or is inactive",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public ProductResponse getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Updates editable fields of an active product.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product updated",
            content = @Content(schema = @Schema(implementation = ProductResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request payload",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product was not found or is inactive",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Product SKU already exists",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public ProductResponse updateProduct(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete product", description = "Performs a logical delete of an active product.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Product deleted"),
        @ApiResponse(
            responseCode = "404",
            description = "Product was not found or is inactive",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Product has inventory and cannot be deleted",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }
}
