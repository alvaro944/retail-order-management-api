package com.alvaro.retail;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RetailOrderManagementApiApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void healthEndpointReturnsApplicationStatus() throws Exception {
        mockMvc.perform(get("/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("retail-order-management-api"))
            .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    void openApiJsonDocumentsCurrentModulesAndKeyResponses() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.info.title").value("Retail Order Management API"))
            .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type").value("http"))
            .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
            .andExpect(jsonPath("$.paths['/products']").exists())
            .andExpect(jsonPath("$.paths['/customers']").exists())
            .andExpect(jsonPath("$.paths['/inventories']").exists())
            .andExpect(jsonPath("$.paths['/orders']").exists())
            .andExpect(jsonPath("$.paths['/auth/login']").exists())
            .andExpect(jsonPath("$.paths['/auth/me']").exists())
            .andExpect(jsonPath("$.paths['/orders/{id}/cancel']").exists())
            .andExpect(jsonPath("$.paths['/products'].post.responses['201']").exists())
            .andExpect(jsonPath("$.paths['/auth/login'].post.responses['200']").exists())
            .andExpect(jsonPath("$.paths['/products'].post.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/products'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/customers'].post.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/customers'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/inventories'].post.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/inventories'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/products/{productId}/inventory'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/orders'].post.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/orders'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/orders/{id}/cancel'].post.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/auth/me'].get.responses['200']").exists())
            .andExpect(jsonPath("$.paths['/auth/me'].get.security[0].bearerAuth").exists())
            .andExpect(jsonPath("$.paths['/products/{id}'].get.responses['404']").exists())
            .andExpect(jsonPath("$.paths['/inventories/{id}/adjust'].patch.responses['409']").exists())
            .andExpect(jsonPath("$.paths['/orders'].post.responses['400']").exists())
            .andExpect(jsonPath("$.paths['/orders/{id}/cancel'].post.responses['409']").exists());
    }

    @Test
    void swaggerUiEndpointServesDocumentationPage() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
            .andExpect(content().string(org.hamcrest.Matchers.containsString("Swagger UI")));
    }
}
