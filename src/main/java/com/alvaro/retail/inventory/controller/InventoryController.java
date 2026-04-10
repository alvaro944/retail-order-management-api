package com.alvaro.retail.inventory.controller;

import com.alvaro.retail.inventory.dto.InventoryAdjustmentRequest;
import com.alvaro.retail.inventory.dto.InventoryCreateRequest;
import com.alvaro.retail.inventory.dto.InventoryResponse;
import com.alvaro.retail.inventory.dto.InventoryUpdateRequest;
import com.alvaro.retail.inventory.service.InventoryService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@Tag(name = "inventory", description = "Inventory management operations")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/inventories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create inventory", description = "Creates the single inventory record for an active product.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Inventory created",
            content = @Content(schema = @Schema(implementation = InventoryResponse.class))
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
            description = "Inventory already exists for the product",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public InventoryResponse createInventory(@Valid @RequestBody InventoryCreateRequest request) {
        return inventoryService.createInventory(request);
    }

    @GetMapping("/inventories")
    @Operation(summary = "List inventories", description = "Returns all current inventory records.")
    @ApiResponse(
        responseCode = "200",
        description = "Inventory list",
        content = @Content(array = @ArraySchema(schema = @Schema(implementation = InventoryResponse.class)))
    )
    public List<InventoryResponse> getInventories() {
        return inventoryService.getInventories();
    }

    @GetMapping("/inventories/{id}")
    @Operation(summary = "Get inventory by id", description = "Returns one inventory record by inventory identifier.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Inventory found",
            content = @Content(schema = @Schema(implementation = InventoryResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory was not found",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public InventoryResponse getInventoryById(@PathVariable Long id) {
        return inventoryService.getInventoryById(id);
    }

    @GetMapping("/products/{productId}/inventory")
    @Operation(summary = "Get inventory by product id", description = "Returns the inventory record associated with one active product.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Inventory found",
            content = @Content(schema = @Schema(implementation = InventoryResponse.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory or product was not found",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public InventoryResponse getInventoryByProductId(@PathVariable Long productId) {
        return inventoryService.getInventoryByProductId(productId);
    }

    @PutMapping("/inventories/{id}")
    @Operation(summary = "Update inventory", description = "Updates editable inventory fields such as minimum stock.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Inventory updated",
            content = @Content(schema = @Schema(implementation = InventoryResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request payload",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory was not found",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public InventoryResponse updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryUpdateRequest request) {
        return inventoryService.updateInventory(id, request);
    }

    @PatchMapping("/inventories/{id}/adjust")
    @Operation(summary = "Adjust inventory", description = "Increases or decreases inventory quantity for an existing inventory record.")
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Inventory adjusted",
            content = @Content(schema = @Schema(implementation = InventoryResponse.class))
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request payload",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Inventory was not found",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        ),
        @ApiResponse(
            responseCode = "409",
            description = "Inventory conflict such as insufficient stock",
            content = @Content(mediaType = "application/problem+json", schema = @Schema(implementation = ProblemDetail.class))
        )
    })
    public InventoryResponse adjustInventory(@PathVariable Long id, @Valid @RequestBody InventoryAdjustmentRequest request) {
        return inventoryService.adjustInventory(id, request);
    }
}
