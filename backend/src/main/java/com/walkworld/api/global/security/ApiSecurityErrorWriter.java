package com.walkworld.api.global.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.walkworld.api.global.error.BaseErrorCode;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApiSecurityErrorWriter {

  private final ObjectMapper objectMapper;

  public void write(HttpServletResponse response, BaseErrorCode errorCode) throws IOException {
    response.setStatus(errorCode.getHttpStatus().value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    objectMapper.writeValue(
        response.getWriter(), ApiResponse.error(errorCode.getCode(), errorCode.getMessage()));
  }
}
