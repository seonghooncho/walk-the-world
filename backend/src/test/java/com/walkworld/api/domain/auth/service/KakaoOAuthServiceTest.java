package com.walkworld.api.domain.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import com.walkworld.api.domain.auth.error.AuthException;
import com.walkworld.api.global.config.JwtProperties;
import com.walkworld.api.global.config.OAuthProperties;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.util.UriComponentsBuilder;

class KakaoOAuthServiceTest {

  private KakaoOAuthService kakaoOAuthService;

  @BeforeEach
  void setUp() {
    OAuthProperties oauthProperties = new OAuthProperties();
    oauthProperties.getKakao().setClientId("kakao-client-id");

    JwtProperties jwtProperties = new JwtProperties();
    jwtProperties.setSecret("test-secret-key-with-at-least-thirty-two-characters");

    kakaoOAuthService = new KakaoOAuthService(oauthProperties, jwtProperties, mock(AuthService.class));
  }

  @Test
  void buildAuthorizationUriDecodesEncodedFrontendOriginAndRedirectPath() {
    URI authorizationUri =
        kakaoOAuthService.buildAuthorizationUri(
            "https%3A%2F%2Ffrontend.example.com",
            "%2Ffeed%3Ftab%3Dfriends",
            request());

    String state =
        UriComponentsBuilder.fromUri(authorizationUri)
            .build()
            .getQueryParams()
            .getFirst("state");

    String payload = decodeJwtPayload(state);

    assertTrue(payload.contains("\"frontendOrigin\":\"https://frontend.example.com\""));
    assertTrue(payload.contains("\"redirectPath\":\"/feed?tab=friends\""));
  }

  @Test
  void buildAuthorizationUriRejectsInvalidFrontendOriginScheme() {
    assertThrows(
        AuthException.class,
        () -> kakaoOAuthService.buildAuthorizationUri("javascript%3Aalert(1)", "/", request()));
  }

  @Test
  void buildAuthorizationUriAllowsMobileCustomSchemeOrigin() {
    URI authorizationUri =
        kakaoOAuthService.buildAuthorizationUri("walkworld%3A%2F%2F%2F", "%2F", request());

    String state =
        UriComponentsBuilder.fromUri(authorizationUri)
            .build()
            .getQueryParams()
            .getFirst("state");

    String payload = decodeJwtPayload(state);

    assertTrue(payload.contains("\"frontendOrigin\":\"walkworld:///\""));
    assertTrue(payload.contains("\"redirectPath\":\"/\""));
  }

  @Test
  void buildAuthorizationUriRejectsOriginOutsideAllowList() {
    OAuthProperties oauthProperties = new OAuthProperties();
    oauthProperties.getKakao().setClientId("kakao-client-id");
    oauthProperties.setAllowedFrontendOrigins("https://allowed.example.com,walkworld:///");

    JwtProperties jwtProperties = new JwtProperties();
    jwtProperties.setSecret("test-secret-key-with-at-least-thirty-two-characters");

    KakaoOAuthService restrictedService =
        new KakaoOAuthService(oauthProperties, jwtProperties, mock(AuthService.class));

    assertThrows(
        AuthException.class,
        () ->
            restrictedService.buildAuthorizationUri(
                "https://frontend.example.com", "/", request()));
  }

  @Test
  void buildAuthorizationUriUsesApiHostForCallbackRedirectUri() {
    URI authorizationUri =
        kakaoOAuthService.buildAuthorizationUri("https://frontend.example.com", "/", request());

    String redirectUri =
        UriComponentsBuilder.fromUri(authorizationUri)
            .build()
            .getQueryParams()
            .getFirst("redirect_uri");

    assertEquals("https://api.example.com/api/auth/v1/oauth/kakao/callback", redirectUri);
  }

  @Test
  void buildAuthorizationUriUsesConfiguredPublicApiBaseUrlForCallbackRedirectUri() {
    OAuthProperties oauthProperties = new OAuthProperties();
    oauthProperties.getKakao().setClientId("kakao-client-id");
    oauthProperties.setPublicApiBaseUrl("https://walk2world.cloud");

    JwtProperties jwtProperties = new JwtProperties();
    jwtProperties.setSecret("test-secret-key-with-at-least-thirty-two-characters");

    KakaoOAuthService service =
        new KakaoOAuthService(oauthProperties, jwtProperties, mock(AuthService.class));

    URI authorizationUri =
        service.buildAuthorizationUri("https://frontend.example.com", "/", request());

    String redirectUri =
        UriComponentsBuilder.fromUri(authorizationUri)
            .build()
            .getQueryParams()
            .getFirst("redirect_uri");

    assertEquals("https://walk2world.cloud/api/auth/v1/oauth/kakao/callback", redirectUri);
  }

  @Test
  void buildFailureRedirectUsesCallbackPathForMobileScheme() {
    URI authorizationUri =
        kakaoOAuthService.buildAuthorizationUri("walkworld%3A%2F%2F%2F", "%2Ffeed", request());

    String state =
        UriComponentsBuilder.fromUri(authorizationUri)
            .build()
            .getQueryParams()
            .getFirst("state");

    URI failureRedirect = kakaoOAuthService.buildFailureRedirect(state, "access_denied");

    assertEquals(
        "walkworld:///auth/callback?redirect=/feed&error=kakao&message=access_denied",
        failureRedirect.toString());
  }

  private MockHttpServletRequest request() {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/auth/v1/oauth/kakao/start");
    request.setScheme("https");
    request.setServerName("api.example.com");
    request.setServerPort(443);
    request.setSecure(true);
    request.setRequestURI("/api/auth/v1/oauth/kakao/start");
    return request;
  }

  private String decodeJwtPayload(String token) {
    String payload = token.split("\\.")[1];
    byte[] decoded = Base64.getUrlDecoder().decode(payload);
    return new String(decoded, StandardCharsets.UTF_8);
  }
}
