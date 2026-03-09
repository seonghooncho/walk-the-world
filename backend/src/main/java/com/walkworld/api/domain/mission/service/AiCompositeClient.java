package com.walkworld.api.domain.mission.service;

import com.walkworld.api.domain.mission.error.MissionErrorCode;
import com.walkworld.api.domain.mission.error.MissionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Component
public class AiCompositeClient {

  private final String apiBaseUrl;

  public AiCompositeClient(@Value("${ai.api-base-url:}") String apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
  }

  public boolean isConfigured() {
    return StringUtils.hasText(apiBaseUrl);
  }

  public CompositeResult composite(String sourceKey, String outputKey, String prompt) {
    try {
      ComposeResponse response =
          RestClient.builder()
              .baseUrl(apiBaseUrl)
              .build()
              .post()
              .uri("/compose")
              .contentType(MediaType.APPLICATION_JSON)
              .body(new ComposeRequest(sourceKey, outputKey, prompt))
              .retrieve()
              .body(ComposeResponse.class);

      if (response == null || !StringUtils.hasText(response.outputKey())) {
        throw new IllegalStateException("AI response missing outputKey");
      }

      return new CompositeResult(response.outputKey(), response.prompt());
    } catch (Exception exception) {
      throw new MissionException(MissionErrorCode.AI_SERVICE_UNAVAILABLE);
    }
  }

  private record ComposeRequest(String sourceKey, String outputKey, String prompt) {}

  private record ComposeResponse(String outputKey, String prompt) {}

  public record CompositeResult(String outputKey, String prompt) {}
}
