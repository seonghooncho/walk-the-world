package com.walkworld.api.global.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.walkworld.api.domain.auth.error.AuthErrorCode;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiSecurityErrorWriterTest {

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final ApiSecurityErrorWriter writer = new ApiSecurityErrorWriter(objectMapper);

  @Test
  void writesUnauthorizedJsonResponse() throws Exception {
    MockHttpServletResponse response = new MockHttpServletResponse();

    writer.write(response, AuthErrorCode.UNAUTHORIZED);

    JsonNode body = objectMapper.readTree(response.getContentAsString());
    assertThat(response.getStatus()).isEqualTo(401);
    assertThat(response.getContentType()).startsWith(MediaType.APPLICATION_JSON_VALUE);
    assertThat(body.get("success").asBoolean()).isFalse();
    assertThat(body.get("error").get("code").asText()).isEqualTo("UNAUTHORIZED");
  }
}
