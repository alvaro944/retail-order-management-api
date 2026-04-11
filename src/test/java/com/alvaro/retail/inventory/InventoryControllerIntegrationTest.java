package com.alvaro.retail.inventory;

import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static com.alvaro.retail.support.AuthTestHelper.bearerToken;
import static com.alvaro.retail.support.AuthTestHelper.obtainAccessToken;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class InventoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        inventoryRepository.deleteAll();
        productRepository.deleteAll();
        accessToken = obtainAccessToken(mockMvc);
    }

    @Test
    void getInventoriesWithoutTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/inventories"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Authentication is required to access this resource"))
            .andExpect(jsonPath("$.path").value("/inventories"));
    }

    @Test
    void createInventoryReturnsCreatedInventory() throws Exception {
        Product product = persistProduct("Mouse", "Compact mouse", new BigDecimal("29.99"), "MOU-100", true);

        mockMvc.perform(authorized(post("/inventories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productId": %d,
                      "quantityAvailable": 25,
                      "minimumStock": 5
                    }
                    """.formatted(product.getId()))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.product.id").value(product.getId()))
            .andExpect(jsonPath("$.product.name").value("Mouse"))
            .andExpect(jsonPath("$.quantityAvailable").value(25))
            .andExpect(jsonPath("$.minimumStock").value(5))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void createInventoryWithInvalidPayloadReturnsBadRequest() throws Exception {
        mockMvc.perform(authorized(post("/inventories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "quantityAvailable": -1,
                      "minimumStock": -2
                    }
                    """)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Bad Request"))
            .andExpect(jsonPath("$.detail").value("Request validation failed"))
            .andExpect(jsonPath("$.errors.productId").exists())
            .andExpect(jsonPath("$.errors.quantityAvailable").exists())
            .andExpect(jsonPath("$.errors.minimumStock").exists());
    }

    @Test
    void createInventoryReturnsNotFoundForNonExistentProduct() throws Exception {
        mockMvc.perform(authorized(post("/inventories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productId": 999,
                      "quantityAvailable": 5,
                      "minimumStock": 1
                    }
                    """)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Product with id 999 was not found"));
    }

    @Test
    void createInventoryReturnsNotFoundForInactiveProduct() throws Exception {
        Product product = persistProduct("Archived", "Inactive", new BigDecimal("10.00"), "ARC-100", false);

        mockMvc.perform(authorized(post("/inventories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productId": %d,
                      "quantityAvailable": 5,
                      "minimumStock": 1
                    }
                    """.formatted(product.getId()))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " was not found"));
    }

    @Test
    void createInventoryReturnsConflictForDuplicateProductInventory() throws Exception {
        Product product = persistProduct("Keyboard", "Mechanical", new BigDecimal("79.99"), "KEY-100", true);
        persistInventory(product, 12, 3);

        mockMvc.perform(authorized(post("/inventories")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "productId": %d,
                      "quantityAvailable": 7,
                      "minimumStock": 2
                    }
                    """.formatted(product.getId()))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Inventory for product with id " + product.getId() + " already exists"));
    }

    @Test
    void getInventoryByIdReturnsInventory() throws Exception {
        Product product = persistProduct("Monitor", "27 inch", new BigDecimal("199.99"), "MON-100", true);
        Inventory inventory = persistInventory(product, 8, 2);

        mockMvc.perform(authorized(get("/inventories/{id}", inventory.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(inventory.getId()))
            .andExpect(jsonPath("$.product.id").value(product.getId()))
            .andExpect(jsonPath("$.quantityAvailable").value(8))
            .andExpect(jsonPath("$.minimumStock").value(2));
    }

    @Test
    void getInventoryByProductIdReturnsInventory() throws Exception {
        Product product = persistProduct("Dock", "USB-C dock", new BigDecimal("89.99"), "DOC-100", true);
        Inventory inventory = persistInventory(product, 6, 1);

        mockMvc.perform(authorized(get("/products/{productId}/inventory", product.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(inventory.getId()))
            .andExpect(jsonPath("$.product.sku").value("DOC-100"))
            .andExpect(jsonPath("$.quantityAvailable").value(6));
    }

    @Test
    void getInventoriesReturnsOnlyActiveProductsOrderedByProductName() throws Exception {
        Product zooProduct = persistProduct("Zoo Item", "Last", new BigDecimal("10.00"), "INV-3", true);
        Product alphaProduct = persistProduct("Alpha Item", "First", new BigDecimal("11.00"), "INV-1", true);
        Product hiddenProduct = persistProduct("Hidden Item", "Inactive", new BigDecimal("12.00"), "INV-2", false);

        persistInventory(zooProduct, 10, 1);
        persistInventory(alphaProduct, 11, 2);
        persistInventory(hiddenProduct, 12, 3);

        mockMvc.perform(authorized(get("/inventories")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].product.name").value("Alpha Item"))
            .andExpect(jsonPath("$[1].product.name").value("Zoo Item"));
    }

    @Test
    void updateInventoryReplacesMinimumStock() throws Exception {
        Product product = persistProduct("Laptop Stand", "Aluminium", new BigDecimal("39.99"), "LST-100", true);
        Inventory inventory = persistInventory(product, 15, 4);

        mockMvc.perform(authorized(put("/inventories/{id}", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "minimumStock": 9
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(inventory.getId()))
            .andExpect(jsonPath("$.quantityAvailable").value(15))
            .andExpect(jsonPath("$.minimumStock").value(9));
    }

    @Test
    void updateInventoryRefreshesUpdatedAtTimestamp() throws Exception {
        Product product = persistProduct("Cable", "USB-C cable", new BigDecimal("9.99"), "CAB-100", true);
        Inventory inventory = persistInventory(product, 50, 5);
        Instant createdAt = inventory.getCreatedAt();

        Thread.sleep(20);

        mockMvc.perform(authorized(put("/inventories/{id}", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "minimumStock": 7
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(result -> {
                String content = result.getResponse().getContentAsString();
                String updatedAtText = com.jayway.jsonpath.JsonPath.read(content, "$.updatedAt");
                Instant updatedAt = Instant.parse(updatedAtText);
                if (!updatedAt.isAfter(createdAt)) {
                    throw new AssertionError("updatedAt should be after createdAt");
                }
            });
    }

    @Test
    void updateInventoryRefreshesUpdatedAtTimestampEvenWhenMinimumStockDoesNotChange() throws Exception {
        Product product = persistProduct("Hub", "USB hub", new BigDecimal("19.99"), "HUB-100", true);
        Inventory inventory = persistInventory(product, 12, 4);

        Thread.sleep(20);

        mockMvc.perform(authorized(put("/inventories/{id}", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "minimumStock": 6
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(result -> {
                String content = result.getResponse().getContentAsString();
                String updatedAtText = com.jayway.jsonpath.JsonPath.read(content, "$.updatedAt");
                inventory.setUpdatedAt(Instant.parse(updatedAtText));
            });

        Instant firstUpdatedAt = inventory.getUpdatedAt();

        Thread.sleep(20);

        mockMvc.perform(authorized(put("/inventories/{id}", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "minimumStock": 6
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(result -> {
                String content = result.getResponse().getContentAsString();
                String updatedAtText = com.jayway.jsonpath.JsonPath.read(content, "$.updatedAt");
                Instant updatedAt = Instant.parse(updatedAtText);
                if (!updatedAt.isAfter(firstUpdatedAt)) {
                    throw new AssertionError("updatedAt should be refreshed even when minimumStock is unchanged");
                }
            });
    }

    @Test
    void adjustInventoryIncreasesQuantity() throws Exception {
        Product product = persistProduct("Phone", "Smartphone", new BigDecimal("499.99"), "PHN-100", true);
        Inventory inventory = persistInventory(product, 20, 2);

        mockMvc.perform(authorized(patch("/inventories/{id}/adjust", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "INCREASE",
                      "quantity": 5
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantityAvailable").value(25))
            .andExpect(jsonPath("$.minimumStock").value(2));
    }

    @Test
    void adjustInventoryDecreasesQuantityWithoutGoingNegative() throws Exception {
        Product product = persistProduct("Tablet", "Tablet", new BigDecimal("299.99"), "TAB-100", true);
        Inventory inventory = persistInventory(product, 20, 2);

        mockMvc.perform(authorized(patch("/inventories/{id}/adjust", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "DECREASE",
                      "quantity": 6
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.quantityAvailable").value(14));
    }

    @Test
    void adjustInventoryReturnsConflictWhenDecreaseWouldGoNegative() throws Exception {
        Product product = persistProduct("Camera", "Mirrorless", new BigDecimal("799.99"), "CAM-100", true);
        Inventory inventory = persistInventory(product, 3, 1);

        mockMvc.perform(authorized(patch("/inventories/{id}/adjust", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "DECREASE",
                      "quantity": 5
                    }
                    """)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Inventory with id " + inventory.getId() + " cannot be reduced below zero"));
    }

    @Test
    void adjustInventoryRefreshesUpdatedAtTimestamp() throws Exception {
        Product product = persistProduct("Charger", "Fast charger", new BigDecimal("24.99"), "CHA-100", true);
        Inventory inventory = persistInventory(product, 10, 2);
        Instant createdAt = inventory.getCreatedAt();

        Thread.sleep(20);

        mockMvc.perform(authorized(patch("/inventories/{id}/adjust", inventory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "INCREASE",
                      "quantity": 1
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(result -> {
                String content = result.getResponse().getContentAsString();
                String updatedAtText = com.jayway.jsonpath.JsonPath.read(content, "$.updatedAt");
                Instant updatedAt = Instant.parse(updatedAtText);
                if (!updatedAt.isAfter(createdAt)) {
                    throw new AssertionError("updatedAt should be after createdAt");
                }
            });
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder requestBuilder) {
        return requestBuilder.header(HttpHeaders.AUTHORIZATION, bearerToken(accessToken));
    }

    private Product persistProduct(String name, String description, BigDecimal price, String sku, boolean active) {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setSku(sku);
        product.setActive(active);
        return productRepository.save(product);
    }

    private Inventory persistInventory(Product product, int quantityAvailable, int minimumStock) {
        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantityAvailable(quantityAvailable);
        inventory.setMinimumStock(minimumStock);
        return inventoryRepository.save(inventory);
    }
}
