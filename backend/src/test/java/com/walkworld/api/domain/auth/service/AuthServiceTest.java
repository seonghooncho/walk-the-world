package com.walkworld.api.domain.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

import com.walkworld.api.domain.auth.dto.res.GoogleUserInfo;
import com.walkworld.api.domain.auth.error.AuthException;
import com.walkworld.api.domain.auth.jwt.JwtProvider;
import com.walkworld.api.domain.auth.repository.RefreshTokenRepository;
import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.config.OAuthProperties;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {

  private AuthService authService;
  private OAuthProperties oauthProperties;

  @BeforeEach
  void setUp() {
    oauthProperties = new OAuthProperties();
    authService =
        new AuthService(
            mock(UserRepository.class),
            mock(RefreshTokenRepository.class),
            mock(UserCurrencyRepository.class),
            mock(PasswordEncoder.class),
            mock(JwtProvider.class),
            oauthProperties);
  }

  @Test
  void mapGoogleUserInfoAcceptsConfiguredAudience() {
    oauthProperties.getGoogle().setAllowedClientIds("web-client-id,ios-client-id,android-client-id");

    Map<String, Object> payload = new HashMap<>();
    payload.put("aud", "ios-client-id");
    payload.put("sub", "google-user-123");
    payload.put("email", "tester@example.com");
    payload.put("name", "Tester");
    payload.put("picture", "https://example.com/avatar.png");
    payload.put("email_verified", "true");

    GoogleUserInfo info = authService.mapGoogleUserInfo(payload);

    assertEquals("google-user-123", info.getSub());
    assertEquals("tester@example.com", info.getEmail());
    assertEquals("Tester", info.getName());
    assertEquals("https://example.com/avatar.png", info.getPicture());
  }

  @Test
  void mapGoogleUserInfoRejectsUnexpectedAudience() {
    oauthProperties.getGoogle().setAllowedClientIds("web-client-id,ios-client-id");

    Map<String, Object> payload = new HashMap<>();
    payload.put("aud", "android-client-id");
    payload.put("sub", "google-user-123");

    assertThrows(AuthException.class, () -> authService.mapGoogleUserInfo(payload));
  }

  @Test
  void mapGoogleUserInfoAllowsAudienceWhenNoAllowListConfigured() {
    Map<String, Object> payload = new HashMap<>();
    payload.put("aud", "some-client-id");
    payload.put("sub", "google-user-123");

    GoogleUserInfo info = authService.mapGoogleUserInfo(payload);

    assertEquals("google-user-123", info.getSub());
  }
}
