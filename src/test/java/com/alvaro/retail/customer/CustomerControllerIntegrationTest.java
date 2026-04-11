package com.alvaro.retail.customer;

import com.alvaro.retail.customer.entity.Customer;
import com.alvaro.retail.customer.repository.CustomerRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        customerRepository.deleteAll();
        accessToken = obtainAccessToken(mockMvc);
    }

    @Test
    void getCustomersWithoutTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/customers"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Authentication is required to access this resource"))
            .andExpect(jsonPath("$.path").value("/customers"));
    }

    @Test
    void createCustomerReturnsCreatedCustomer() throws Exception {
        mockMvc.perform(authorized(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "Ana",
                      "lastName": "Garcia",
                      "email": "ana.garcia@example.com",
                      "phone": "+34 600 000 001"
                    }
                    """)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").isNumber())
            .andExpect(jsonPath("$.firstName").value("Ana"))
            .andExpect(jsonPath("$.lastName").value("Garcia"))
            .andExpect(jsonPath("$.email").value("ana.garcia@example.com"))
            .andExpect(jsonPath("$.phone").value("+34 600 000 001"))
            .andExpect(jsonPath("$.active").value(true))
            .andExpect(jsonPath("$.createdAt").exists())
            .andExpect(jsonPath("$.updatedAt").exists());
    }

    @Test
    void createCustomerWithInvalidPayloadReturnsBadRequest() throws Exception {
        mockMvc.perform(authorized(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "",
                      "lastName": "",
                      "email": "not-an-email",
                      "phone": null
                    }
                    """)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.title").value("Bad Request"))
            .andExpect(jsonPath("$.detail").value("Request validation failed"))
            .andExpect(jsonPath("$.errors.firstName").exists())
            .andExpect(jsonPath("$.errors.lastName").exists())
            .andExpect(jsonPath("$.errors.email").exists());
    }

    @Test
    void createCustomerWithDuplicateEmailReturnsConflict() throws Exception {
        persistCustomer("Luis", "Perez", "luis.perez@example.com", null, true);

        mockMvc.perform(authorized(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "Otro",
                      "lastName": "Usuario",
                      "email": "luis.perez@example.com"
                    }
                    """)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.title").value("Conflict"))
            .andExpect(jsonPath("$.detail").value("Customer with email luis.perez@example.com already exists"));
    }

    @Test
    void getCustomerByIdReturnsActiveCustomer() throws Exception {
        Customer customer = persistCustomer("Marta", "Lopez", "marta@example.com", null, true);

        mockMvc.perform(authorized(get("/customers/{id}", customer.getId())))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(customer.getId()))
            .andExpect(jsonPath("$.firstName").value("Marta"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void getCustomerByIdReturnsNotFoundForInactiveCustomer() throws Exception {
        Customer customer = persistCustomer("Inactivo", "User", "inactive@example.com", null, false);

        mockMvc.perform(authorized(get("/customers/{id}", customer.getId())))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Customer with id " + customer.getId() + " was not found"));
    }

    @Test
    void getCustomerByIdReturnsNotFoundForNonExistentCustomer() throws Exception {
        mockMvc.perform(authorized(get("/customers/{id}", 999L)))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.detail").value("Customer with id 999 was not found"));
    }

    @Test
    void getCustomersReturnsOnlyActiveCustomersOrderedByLastNameThenFirstNameThenId() throws Exception {
        persistCustomer("Carl", "Ruiz", "c.ruiz@example.com", null, true);
        persistCustomer("Ana", "Ruiz", "a.ruiz@example.com", null, true);
        persistCustomer("Hidden", "Garcia", "hidden@example.com", null, false);
        persistCustomer("Bea", "Alvarez", "b.alvarez@example.com", null, true);

        mockMvc.perform(authorized(get("/customers")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3))
            .andExpect(jsonPath("$[0].lastName").value("Alvarez"))
            .andExpect(jsonPath("$[1].firstName").value("Ana"))
            .andExpect(jsonPath("$[1].lastName").value("Ruiz"))
            .andExpect(jsonPath("$[2].firstName").value("Carl"))
            .andExpect(jsonPath("$[2].lastName").value("Ruiz"));
    }

    @Test
    void updateCustomerReplacesEditableFieldsAndKeepsCustomerActive() throws Exception {
        Customer customer = persistCustomer("Old", "Name", "old@example.com", null, true);

        mockMvc.perform(authorized(put("/customers/{id}", customer.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "New",
                      "lastName": "Name",
                      "email": "new@example.com",
                      "phone": "+34 600 000 099"
                    }
                    """)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(customer.getId()))
            .andExpect(jsonPath("$.firstName").value("New"))
            .andExpect(jsonPath("$.email").value("new@example.com"))
            .andExpect(jsonPath("$.phone").value("+34 600 000 099"))
            .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void updateCustomerRefreshesUpdatedAtTimestamp() throws Exception {
        Customer customer = persistCustomer("Ts", "Test", "ts@example.com", null, true);
        Instant createdAt = customer.getCreatedAt();

        Thread.sleep(20);

        mockMvc.perform(authorized(put("/customers/{id}", customer.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "Ts",
                      "lastName": "Test",
                      "email": "ts.updated@example.com"
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
    void updateCustomerWithDuplicateEmailReturnsConflict() throws Exception {
        Customer first = persistCustomer("First", "User", "first@example.com", null, true);
        persistCustomer("Second", "User", "second@example.com", null, true);

        mockMvc.perform(authorized(put("/customers/{id}", first.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "firstName": "First",
                      "lastName": "User",
                      "email": "second@example.com"
                    }
                    """)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.detail").value("Customer with email second@example.com already exists"));
    }

    @Test
    void deleteCustomerPerformsSoftDeleteAndHidesCustomerFromReads() throws Exception {
        Customer customer = persistCustomer("ToDelete", "User", "delete@example.com", null, true);

        mockMvc.perform(authorized(delete("/customers/{id}", customer.getId())))
            .andExpect(status().isNoContent());

        mockMvc.perform(authorized(get("/customers/{id}", customer.getId())))
            .andExpect(status().isNotFound());

        mockMvc.perform(authorized(get("/customers")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(0));
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder requestBuilder) {
        return requestBuilder.header(HttpHeaders.AUTHORIZATION, bearerToken(accessToken));
    }

    private Customer persistCustomer(String firstName, String lastName, String email, String phone, boolean active) {
        Customer customer = new Customer();
        customer.setFirstName(firstName);
        customer.setLastName(lastName);
        customer.setEmail(email);
        customer.setPhone(phone);
        customer.setActive(active);
        return customerRepository.save(customer);
    }
}
