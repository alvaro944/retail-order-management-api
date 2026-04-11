package com.alvaro.retail.support;

import com.jayway.jsonpath.JsonPath;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public final class AuthTestHelper {

    private AuthTestHelper() {
    }

    public static String obtainAccessToken(MockMvc mockMvc) throws Exception {
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

        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    public static String bearerToken(String accessToken) {
        return "Bearer " + accessToken;
    }
}
