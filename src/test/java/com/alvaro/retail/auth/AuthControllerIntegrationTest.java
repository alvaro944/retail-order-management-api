package com.alvaro.retail.auth;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginWithValidCredentialsReturnsJwtAndExpiry() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "admin",
                      "password": "admin123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType").value("Bearer"))
            .andExpect(jsonPath("$.accessToken").isString())
            .andExpect(jsonPath("$.accessToken", Matchers.not(Matchers.blankOrNullString())))
            .andExpect(jsonPath("$.expiresAt").isString());
    }

    @Test
    void loginWithInvalidCredentialsReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "admin",
                      "password": "wrong-password"
                    }
                    """))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Invalid username or password"))
            .andExpect(jsonPath("$.path").value("/auth/login"));
    }

    @Test
    void authMeWithoutTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("Authentication is required to access this resource"))
            .andExpect(jsonPath("$.path").value("/auth/me"));
    }

    @Test
    void authMeWithValidTokenReturnsAuthenticatedPrincipal() throws Exception {
        String accessToken = obtainAccessToken();

        mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("admin"))
            .andExpect(jsonPath("$.roles[0]").value("ADMIN"));
    }

    @Test
    void authMeWithMalformedTokenReturnsUnauthorizedProblemDetail() throws Exception {
        mockMvc.perform(get("/auth/me")
                .header("Authorization", "Bearer invalid-token"))
            .andExpect(status().isUnauthorized())
            .andExpect(header().string("WWW-Authenticate", Matchers.containsString("Bearer")))
            .andExpect(jsonPath("$.title").value("Unauthorized"))
            .andExpect(jsonPath("$.detail").value("The access token is invalid or expired"))
            .andExpect(jsonPath("$.path").value("/auth/me"));
    }

    private String obtainAccessToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "admin",
                      "password": "admin123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        return com.jayway.jsonpath.JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }
}
