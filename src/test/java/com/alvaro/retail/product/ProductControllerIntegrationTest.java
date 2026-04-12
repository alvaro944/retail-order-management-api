package com.alvaro.retail.product;

import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import org.hamcrest.Matchers;
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

import java.math.BigDecimal;
import java.time.Instant;

import static com.alvaro.retail.support.AuthTestHelper.bearerToken;
import static com.alvaro.retail.support.AuthTestHelper.obtainAccessToken;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerIntegrationTest {

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
    void getProductsWithoutTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/products"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Authentication is required to access this resource"))
            .andExpect(jsonPath("$.path").value("/products"));
    }

    @Test
    void getProductsWithMalformedTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/products")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", Matchers.containsString("Bearer")))
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("The access token is invalid or expired"))
            .andExpect(jsonPath("$.path").value("/products"));
    }

    @Test
    void createProductReturnsCreatedProduct() throws Exception {
        mockMvc.perform(authorized(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Wireless Mouse",
                      "description": "Compact ergonomic mouse",
                      "price": 29.99,
                      "sku": "WM-100"
                    }
                    """)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.name").value("Wireless Mouse"))
            .andExpect(jsonPath("$.description").value("Compact ergonomic mouse"))
            .andExpect(jsonPath("$.price").value(29.99))
            .andExpect(jsonPath("$.sku").value("WM-100"))
            .andExpect(jsonPath("$.active").value(true))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void createProductWithInvalidPayloadReturnsBadRequest() throws Exception {
        mockMvc.perform(authorized(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "",
                      "description": "x",
                      "price": 0,
                      "sku": ""
                    }
                    """)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Bad Request"))
            .andExpect(jsonPath("$.detail").value("Request validation failed"))
            .andExpect(jsonPath("$.errors.name").exists())
            .andExpect(jsonPath("$.errors.price").exists())
            .andExpect(jsonPath("$.errors.sku").exists());
    }

    @Test
    void createProductWithDuplicateSkuReturnsConflict() throws Exception {
        persistProduct("Keyboard", "Mechanical keyboard", new BigDecimal("79.99"), "KB-100", true);

        mockMvc.perform(authorized(post("/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Second Keyboard",
                      "description": "Another keyboard",
                      "price": 89.99,
                      "sku": "KB-100"
                    }
                    """)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.title").value("Conflict"))
            .andExpect(jsonPath("$.detail").value("Product with sku KB-100 already exists"));
    }

    @Test
    void getProductByIdReturnsActiveProduct() throws Exception {
        Product product = persistProduct("Monitor", "27 inch monitor", new BigDecimal("199.99"), "MN-100", true);

        mockMvc.perform(authorized(get("/products/{id}", product.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(product.getId()))
            .andExpect(jsonPath("$.name").value("Monitor"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void getProductByIdReturnsNotFoundForInactiveProduct() throws Exception {
        Product product = persistProduct("Archived", "Inactive product", new BigDecimal("10.00"), "AR-100", false);

        mockMvc.perform(authorized(get("/products/{id}", product.getId())))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " was not found"));
    }

    @Test
    void getProductsReturnsOnlyActiveProductsOrderedByName() throws Exception {
        persistProduct("Zoo Item", "Last alphabetically", new BigDecimal("10.00"), "SKU-3", true);
        persistProduct("Alpha Item", "First alphabetically", new BigDecimal("11.00"), "SKU-1", true);
        persistProduct("Hidden Item", "Inactive", new BigDecimal("12.00"), "SKU-2", false);

        mockMvc.perform(authorized(get("/products")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Alpha Item"))
            .andExpect(jsonPath("$[1].name").value("Zoo Item"));
    }

    @Test
    void updateProductReplacesEditableFieldsAndKeepsProductActive() throws Exception {
        Product product = persistProduct("Laptop", "Old description", new BigDecimal("999.99"), "LP-100", true);

        mockMvc.perform(authorized(put("/products/{id}", product.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Laptop Pro",
                      "description": "Updated description",
                      "price": 1099.99,
                      "sku": "LP-200"
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(product.getId()))
            .andExpect(jsonPath("$.name").value("Laptop Pro"))
            .andExpect(jsonPath("$.description").value("Updated description"))
            .andExpect(jsonPath("$.price").value(1099.99))
            .andExpect(jsonPath("$.sku").value("LP-200"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void updateProductRefreshesUpdatedAtTimestamp() throws Exception {
        Product product = persistProduct("Camera", "Initial", new BigDecimal("299.99"), "CM-100", true);
        Instant createdAt = product.getCreatedAt();

        Thread.sleep(20);

        mockMvc.perform(authorized(put("/products/{id}", product.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Camera Updated",
                      "description": "Updated",
                      "price": 319.99,
                      "sku": "CM-101"
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
    void updateProductWithDuplicateSkuReturnsConflict() throws Exception {
        Product firstProduct = persistProduct("Phone", "Phone", new BigDecimal("499.99"), "PH-100", true);
        persistProduct("Tablet", "Tablet", new BigDecimal("599.99"), "TB-100", true);

        mockMvc.perform(authorized(put("/products/{id}", firstProduct.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Phone",
                      "description": "Phone",
                      "price": 499.99,
                      "sku": "TB-100"
                    }
                    """)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Product with sku TB-100 already exists"));
    }

    @Test
    void deleteProductPerformsSoftDeleteAndHidesProductFromReads() throws Exception {
        Product product = persistProduct("Speaker", "Portable speaker", new BigDecimal("59.99"), "SP-100", true);

        mockMvc.perform(authorized(delete("/products/{id}", product.getId())))
            .andExpect(status().isNoContent());

        mockMvc.perform(authorized(get("/products/{id}", product.getId())))
            .andExpect(status().isNotFound());

        mockMvc.perform(authorized(get("/products")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deleteProductReturnsConflictWhenInventoryExists() throws Exception {
        Product product = persistProduct("Console", "Gaming console", new BigDecimal("399.99"), "CON-100", true);
        persistInventory(product, 4, 1);

        mockMvc.perform(authorized(delete("/products/{id}", product.getId())))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " has inventory and cannot be deleted"));
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
