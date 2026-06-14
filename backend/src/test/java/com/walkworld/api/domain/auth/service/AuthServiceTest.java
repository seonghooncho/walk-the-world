package com.walkworld.api.domain.auth.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.walkworld.api.domain.auth.dto.req.LoginReqDTO;
import com.walkworld.api.domain.auth.dto.res.GoogleUserInfo;
import com.walkworld.api.domain.auth.error.AuthException;
import com.walkworld.api.domain.auth.jwt.JwtProvider;
import com.walkworld.api.domain.auth.repository.RefreshTokenRepository;
import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.entity.UserStatus;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.config.OAuthProperties;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class AuthServiceTest {

  private AuthService authService;
  private OAuthProperties oauthProperties;
  private UserRepository userRepository;
  private RefreshTokenRepository refreshTokenRepository;
  private PasswordEncoder passwordEncoder;
  private JwtProvider jwtProvider;

  @BeforeEach
  void setUp() {
    oauthProperties = new OAuthProperties();
    userRepository = mock(UserRepository.class);
    refreshTokenRepository = mock(RefreshTokenRepository.class);
    passwordEncoder = mock(PasswordEncoder.class);
    jwtProvider = mock(JwtProvider.class);
    authService =
        new AuthService(
            userRepository,
            refreshTokenRepository,
            mock(UserCurrencyRepository.class),
            passwordEncoder,
            jwtProvider,
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

  @Test
  void loginRestoresWithdrawnAccountWithinGracePeriod() {
    User user =
        User.builder()
            .id(7L)
            .email("tester@example.com")
            .password("encoded")
            .name("tester")
            .status(UserStatus.withdrawn)
            .withdrawnAt(LocalDateTime.now().minusDays(10))
            .build();
    LoginReqDTO request = new LoginReqDTO();
    request.setEmail("tester@example.com");
    request.setPassword("Password1");

    when(userRepository.findByEmail("tester@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Password1", "encoded")).thenReturn(true);
    when(jwtProvider.createAccessToken(7L)).thenReturn("access-token");
    when(jwtProvider.createRefreshToken(7L)).thenReturn("refresh-token");
    when(jwtProvider.getRefreshTokenExpiry()).thenReturn(3_600_000L);

    var tokens = authService.login(request);

    assertTrue(tokens.getRestored());
    assertEquals(UserStatus.active, user.getStatus());
    assertNull(user.getWithdrawnAt());
    verify(userRepository).save(user);
    verify(refreshTokenRepository).save(any());
  }

  @Test
  void loginRejectsWithdrawnAccountAfterGracePeriod() {
    User user =
        User.builder()
            .id(7L)
            .email("tester@example.com")
            .password("encoded")
            .name("tester")
            .status(UserStatus.withdrawn)
            .withdrawnAt(LocalDateTime.now().minusDays(31))
            .build();
    LoginReqDTO request = new LoginReqDTO();
    request.setEmail("tester@example.com");
    request.setPassword("Password1");

    when(userRepository.findByEmail("tester@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Password1", "encoded")).thenReturn(true);

    AuthException exception = assertThrows(AuthException.class, () -> authService.login(request));

    assertEquals("ACCOUNT_WITHDRAWN_EXPIRED", exception.getCode());
  }
}
