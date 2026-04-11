package com.alvaro.retail.order;

import com.alvaro.retail.customer.entity.Customer;
import com.alvaro.retail.customer.repository.CustomerRepository;
import com.alvaro.retail.inventory.entity.Inventory;
import com.alvaro.retail.inventory.repository.InventoryRepository;
import com.alvaro.retail.order.repository.OrderRepository;
import com.alvaro.retail.product.entity.Product;
import com.alvaro.retail.product.repository.ProductRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import static com.alvaro.retail.support.AuthTestHelper.bearerToken;
import static com.alvaro.retail.support.AuthTestHelper.obtainAccessToken;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private OrderRepository orderRepository;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        orderRepository.deleteAll();
        inventoryRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
        accessToken = obtainAccessToken(mockMvc);
    }

    @Test
    void getOrdersWithoutTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/orders"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Authentication is required to access this resource"))
            .andExpect(jsonPath("$.path").value("/orders"));
    }

    @Test
    void createOrderReturnsCreatedOrderAndReducesInventory() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        Inventory inventory = persistInventory(product, 10, 2);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 3
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.customer.id").value(customer.getId()))
            .andExpect(jsonPath("$.customer.firstName").value("Ana"))
            .andExpect(jsonPath("$.customer.lastName").value("Garcia"))
            .andExpect(jsonPath("$.customer.email").value("ana@example.com"))
            .andExpect(jsonPath("$.status").value("CREATED"))
            .andExpect(jsonPath("$.totalAmount").value(89.97))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].productId").value(product.getId()))
            .andExpect(jsonPath("$.items[0].productName").value("Wireless Mouse"))
            .andExpect(jsonPath("$.items[0].productSku").value("WM-100"))
            .andExpect(jsonPath("$.items[0].unitPrice").value(29.99))
            .andExpect(jsonPath("$.items[0].quantity").value(3))
            .andExpect(jsonPath("$.items[0].subtotal").value(89.97))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.updatedAt").exists());

        Inventory updatedInventory = inventoryRepository.findById(inventory.getId()).orElseThrow();
        Assertions.assertEquals(7, updatedInventory.getQuantityAvailable());
    }

    @Test
    void createOrderWithMultipleItemsCalculatesTotalAmount() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product mouse = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        Product keyboard = persistProduct("Mechanical Keyboard", "Gaming keyboard", new BigDecimal("89.50"), "MK-200", true);
        persistInventory(mouse, 10, 2);
        persistInventory(keyboard, 4, 1);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 2
                        },
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), mouse.getId(), keyboard.getId()))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.items.length()").value(2))
            .andExpect(jsonPath("$.items[0].subtotal").value(59.98))
            .andExpect(jsonPath("$.items[1].subtotal").value(89.50))
            .andExpect(jsonPath("$.totalAmount").value(149.48));
    }

    @Test
    void createOrderWithInvalidPayloadReturnsBadRequest() throws Exception {
        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "items": [
                        {
                          "quantity": 0
                        }
                      ]
                    }
                    """)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Bad Request"))
            .andExpect(jsonPath("$.detail").value("Request validation failed"))
            .andExpect(jsonPath("$.errors.customerId").exists())
            .andExpect(jsonPath("$.errors['items[0].productId']").exists())
            .andExpect(jsonPath("$.errors['items[0].quantity']").exists());
    }

    @Test
    void createOrderWithoutItemsReturnsBadRequest() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": []
                    }
                    """.formatted(customer.getId()))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.errors.items").value("items must not be empty"));
    }

    @Test
    void createOrderReturnsNotFoundForNonExistentCustomer() throws Exception {
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        persistInventory(product, 10, 2);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": 999,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(product.getId()))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Customer with id 999 was not found"));
    }

    @Test
    void createOrderReturnsNotFoundForInactiveCustomer() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", false);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        persistInventory(product, 10, 2);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Customer with id " + customer.getId() + " was not found"));
    }

    @Test
    void createOrderReturnsNotFoundForNonExistentProduct() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": 999,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId()))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Product with id 999 was not found"));
    }

    @Test
    void createOrderReturnsNotFoundForInactiveProduct() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", false);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " was not found"));
    }

    @Test
    void createOrderReturnsConflictWhenInventoryDoesNotExist() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " does not have available stock"));
    }

    @Test
    void createOrderReturnsConflictWhenStockIsInsufficient() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        persistInventory(product, 2, 2);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 3
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " does not have enough stock"));
    }

    @Test
    void createOrderReturnsBadRequestForDuplicateProducts() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        persistInventory(product, 10, 2);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        },
                        {
                          "productId": %d,
                          "quantity": 2
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId(), product.getId()))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("Product with id " + product.getId() + " is duplicated in the order"));
    }

    @Test
    void getOrderByIdReturnsExistingOrder() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        persistInventory(product, 10, 2);

        MvcResult createResult = mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 2
                        }
                      ]
                    }
                    """.formatted(customer.getId(), product.getId()))))
            .andExpect(status().isCreated())
            .andReturn();

        Number orderId = com.jayway.jsonpath.JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");

        mockMvc.perform(authorized(get("/orders/{id}", orderId.longValue())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(orderId.longValue()))
            .andExpect(jsonPath("$.customer.email").value("ana@example.com"))
            .andExpect(jsonPath("$.items[0].quantity").value(2))
            .andExpect(jsonPath("$.totalAmount").value(59.98));
    }

    @Test
    void getOrderByIdReturnsNotFoundWhenOrderDoesNotExist() throws Exception {
        mockMvc.perform(authorized(get("/orders/{id}", 999L)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Order with id 999 was not found"));
    }

    @Test
    void cancelOrderReturnsUpdatedOrderAndRestoresInventory() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        Inventory inventory = persistInventory(product, 10, 2);

        Long orderId = createOrder(customer.getId(), product.getId(), 3);

        mockMvc.perform(authorized(post("/orders/{id}/cancel", orderId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(orderId))
            .andExpect(jsonPath("$.status").value("CANCELLED"))
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].productId").value(product.getId()))
            .andExpect(jsonPath("$.items[0].quantity").value(3))
            .andExpect(jsonPath("$.totalAmount").value(89.97));

        Inventory restoredInventory = inventoryRepository.findById(inventory.getId()).orElseThrow();
        Assertions.assertEquals(10, restoredInventory.getQuantityAvailable());
        Assertions.assertEquals("CANCELLED", orderRepository.findById(orderId).orElseThrow().getStatus().name());

        mockMvc.perform(authorized(get("/orders/{id}", orderId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void cancelOrderReturnsConflictWhenOrderIsAlreadyCancelled() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product product = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        Inventory inventory = persistInventory(product, 10, 2);

        Long orderId = createOrder(customer.getId(), product.getId(), 3);

        mockMvc.perform(authorized(post("/orders/{id}/cancel", orderId)))
            .andExpect(status().isOk());

        mockMvc.perform(authorized(post("/orders/{id}/cancel", orderId)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Order with id " + orderId + " is already cancelled"));

        Inventory restoredInventory = inventoryRepository.findById(inventory.getId()).orElseThrow();
        Assertions.assertEquals(10, restoredInventory.getQuantityAvailable());
    }

    @Test
    void cancelOrderReturnsNotFoundWhenOrderDoesNotExist() throws Exception {
        mockMvc.perform(authorized(post("/orders/{id}/cancel", 999L)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Order with id 999 was not found"));
    }

    @Test
    void getOrdersReturnsOrdersSortedByMostRecentFirst() throws Exception {
        Customer customer = persistCustomer("Ana", "Garcia", "ana@example.com", true);
        Product mouse = persistProduct("Wireless Mouse", "Compact mouse", new BigDecimal("29.99"), "WM-100", true);
        Product keyboard = persistProduct("Mechanical Keyboard", "Gaming keyboard", new BigDecimal("89.50"), "MK-200", true);
        persistInventory(mouse, 10, 2);
        persistInventory(keyboard, 5, 1);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), mouse.getId()))))
            .andExpect(status().isCreated());

        Thread.sleep(20);

        mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": 1
                        }
                      ]
                    }
                    """.formatted(customer.getId(), keyboard.getId()))))
            .andExpect(status().isCreated());

        mockMvc.perform(authorized(get("/orders")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].items[0].productSku").value("MK-200"))
            .andExpect(jsonPath("$[1].items[0].productSku").value("WM-100"));
    }

    private Long createOrder(Long customerId, Long productId, int quantity) throws Exception {
        MvcResult createResult = mockMvc.perform(authorized(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "customerId": %d,
                      "items": [
                        {
                          "productId": %d,
                          "quantity": %d
                        }
                      ]
                    }
                    """.formatted(customerId, productId, quantity))))
            .andExpect(status().isCreated())
            .andReturn();

        Number orderId = com.jayway.jsonpath.JsonPath.read(createResult.getResponse().getContentAsString(), "$.id");
        return orderId.longValue();
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder requestBuilder) {
        return requestBuilder.header(HttpHeaders.AUTHORIZATION, bearerToken(accessToken));
    }

    private Customer persistCustomer(String firstName, String lastName, String email, boolean active) {
        Customer customer = new Customer();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setEmail(email);
        customer.setActive(active);
        return customerRepository.save(customer);
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
