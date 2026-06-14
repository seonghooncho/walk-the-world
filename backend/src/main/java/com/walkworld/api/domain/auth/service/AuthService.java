package com.walkworld.api.domain.auth.service;

import com.walkworld.api.domain.auth.dto.req.ChangePasswordReqDTO;
import com.walkworld.api.domain.auth.dto.req.GoogleLoginReqDTO;
import com.walkworld.api.domain.auth.dto.req.KakaoLoginReqDTO;
import com.walkworld.api.domain.auth.dto.req.LoginReqDTO;
import com.walkworld.api.domain.auth.dto.req.PasswordResetReqDTO;
import com.walkworld.api.domain.auth.dto.req.RefreshReqDTO;
import com.walkworld.api.domain.auth.dto.req.SignupReqDTO;
import com.walkworld.api.domain.auth.dto.res.GoogleUserInfo;
import com.walkworld.api.domain.auth.dto.res.KakaoUserInfo;
import com.walkworld.api.domain.auth.dto.res.TokenResDTO;
import com.walkworld.api.domain.auth.entity.RefreshToken;
import com.walkworld.api.domain.auth.error.AuthErrorCode;
import com.walkworld.api.domain.auth.error.AuthException;
import com.walkworld.api.domain.auth.jwt.JwtProvider;
import com.walkworld.api.domain.auth.repository.RefreshTokenRepository;
import com.walkworld.api.domain.currency.entity.UserCurrency;
import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.entity.UserStatus;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.config.OAuthProperties;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

  private static final int WITHDRAWAL_GRACE_DAYS = 30;
  private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";
  private static final String GOOGLE_TOKEN_INFO_URL =
      "https://oauth2.googleapis.com/tokeninfo?id_token=";

  private final UserRepository userRepository;
  private final RefreshTokenRepository refreshTokenRepository;
  private final UserCurrencyRepository currencyRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtProvider jwtProvider;
  private final OAuthProperties oauthProperties;

  public TokenResDTO signup(SignupReqDTO request) {
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new AuthException(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    }

    User user =
        User.builder()
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .name(request.getName())
            .currentCityId("seoul")
            .build();
    userRepository.save(user);

    currencyRepository.save(
        UserCurrency.builder().userId(user.getId()).coupons(2).hearts(5).build());

    return generateTokens(user.getId(), false);
  }

  public TokenResDTO login(LoginReqDTO request) {
    User user =
        userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new AuthException(AuthErrorCode.INVALID_CREDENTIALS));

    if (user.getPassword() == null) {
      throw new AuthException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new AuthException(AuthErrorCode.INVALID_CREDENTIALS);
    }

    boolean restored = restoreOrRejectWithdrawnAccount(user);
    return generateTokens(user.getId(), restored);
  }

  public TokenResDTO refresh(RefreshReqDTO request) {
    RefreshToken stored =
        refreshTokenRepository
            .findByToken(request.getRefreshToken())
            .orElseThrow(() -> new AuthException(AuthErrorCode.INVALID_TOKEN));

    if (stored.getExpiresAt().isBefore(LocalDateTime.now())) {
      refreshTokenRepository.delete(stored);
      throw new AuthException(AuthErrorCode.TOKEN_EXPIRED);
    }

    User user =
        userRepository
            .findById(stored.getUserId())
            .orElseThrow(() -> new AuthException(AuthErrorCode.INVALID_TOKEN));

    if (!user.isActive()) {
      refreshTokenRepository.delete(stored);
      throw new AuthException(AuthErrorCode.INVALID_TOKEN);
    }

    refreshTokenRepository.delete(stored);
    return generateTokens(stored.getUserId(), false);
  }

  public void logout(RefreshReqDTO request) {
    refreshTokenRepository
        .findByToken(request.getRefreshToken())
        .ifPresent(refreshTokenRepository::delete);
  }

  public void requestPasswordReset(PasswordResetReqDTO request) {
    log.info("Password reset requested for: {}", request.getEmail());
  }

  public void changePassword(Long userId, ChangePasswordReqDTO request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new AuthException(AuthErrorCode.INVALID_CREDENTIALS));

    if (user.getPassword() == null) {
      throw new AuthException(AuthErrorCode.SOCIAL_ACCOUNT_NO_PASSWORD);
    }

    if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
      throw new AuthException(AuthErrorCode.PASSWORD_MISMATCH);
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
  }

  public TokenResDTO kakaoLogin(KakaoLoginReqDTO request) {
    KakaoUserInfo kakaoUser = fetchKakaoUserInfo(request.getAccessToken());

    User user =
        userRepository
            .findByKakaoId(kakaoUser.getId())
            .orElseGet(
                () -> {
                  if (kakaoUser.getEmail() != null) {
                    return userRepository
                        .findByEmail(kakaoUser.getEmail())
                        .map(
                            existing -> {
                              existing.setKakaoId(kakaoUser.getId());
                              return userRepository.save(existing);
                            })
                        .orElseGet(() -> createKakaoUser(kakaoUser));
                  }
                  return createKakaoUser(kakaoUser);
                });

    boolean restored = restoreOrRejectWithdrawnAccount(user);
    return generateTokens(user.getId(), restored);
  }

  public TokenResDTO googleLogin(GoogleLoginReqDTO request) {
    GoogleUserInfo googleUser = verifyGoogleIdToken(request.getIdToken());

    User user =
        userRepository
            .findByGoogleId(googleUser.getSub())
            .orElseGet(
                () -> {
                  if (googleUser.getEmail() != null) {
                    return userRepository
                        .findByEmail(googleUser.getEmail())
                        .map(
                            existing -> {
                              existing.setGoogleId(googleUser.getSub());
                              return userRepository.save(existing);
                            })
                        .orElseGet(() -> createGoogleUser(googleUser));
                  }
                  return createGoogleUser(googleUser);
                });

    boolean restored = restoreOrRejectWithdrawnAccount(user);
    return generateTokens(user.getId(), restored);
  }

  private KakaoUserInfo fetchKakaoUserInfo(String accessToken) {
    try {
      RestTemplate restTemplate = new RestTemplate();
      HttpHeaders headers = new HttpHeaders();
      headers.setBearerAuth(accessToken);
      headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

      ResponseEntity<Map> response =
          restTemplate.exchange(
              KAKAO_USER_INFO_URL, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

      Map body = response.getBody();
      if (body == null) {
        throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
      }

      KakaoUserInfo info = new KakaoUserInfo();
      info.setId(((Number) body.get("id")).longValue());

      Map kakaoAccount = (Map) body.get("kakao_account");
      if (kakaoAccount != null) {
        info.setEmail((String) kakaoAccount.get("email"));
        Map profile = (Map) kakaoAccount.get("profile");
        if (profile != null) {
          info.setNickname((String) profile.get("nickname"));
          info.setProfileImageUrl((String) profile.get("profile_image_url"));
        }
      }

      return info;
    } catch (AuthException exception) {
      throw exception;
    } catch (Exception exception) {
      log.error("Kakao user info fetch failed", exception);
      throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
    }
  }

  private GoogleUserInfo verifyGoogleIdToken(String idToken) {
    try {
      RestTemplate restTemplate = new RestTemplate();
      ResponseEntity<Map> response =
          restTemplate.getForEntity(GOOGLE_TOKEN_INFO_URL + idToken, Map.class);

      Map body = response.getBody();
      if (body == null) {
        throw new AuthException(AuthErrorCode.GOOGLE_AUTH_FAILED);
      }

      return mapGoogleUserInfo(body);
    } catch (AuthException exception) {
      throw exception;
    } catch (Exception exception) {
      log.error("Google ID token verification failed", exception);
      throw new AuthException(AuthErrorCode.GOOGLE_AUTH_FAILED);
    }
  }

  GoogleUserInfo mapGoogleUserInfo(Map body) {
    String audience = body.get("aud") != null ? String.valueOf(body.get("aud")) : null;
    validateGoogleAudience(audience);

    GoogleUserInfo info = new GoogleUserInfo();
    info.setSub((String) body.get("sub"));
    info.setEmail((String) body.get("email"));
    info.setName((String) body.get("name"));
    info.setPicture((String) body.get("picture"));
    info.setEmailVerified("true".equals(String.valueOf(body.get("email_verified"))));

    if (info.getSub() == null) {
      throw new AuthException(AuthErrorCode.GOOGLE_AUTH_FAILED);
    }

    return info;
  }

  private void validateGoogleAudience(String audience) {
    String[] allowedClientIds = allowedGoogleClientIds();
    if (allowedClientIds.length == 0) {
      return;
    }

    boolean matched =
        StringUtils.hasText(audience)
            && Arrays.stream(allowedClientIds)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .anyMatch(audience::equals);

    if (!matched) {
      throw new AuthException(AuthErrorCode.GOOGLE_AUTH_FAILED);
    }
  }

  private String[] allowedGoogleClientIds() {
    if (!StringUtils.hasText(oauthProperties.getGoogle().getAllowedClientIds())) {
      return new String[0];
    }

    return Arrays.stream(oauthProperties.getGoogle().getAllowedClientIds().split(","))
        .map(String::trim)
        .filter(StringUtils::hasText)
        .toArray(String[]::new);
  }

  private User createKakaoUser(KakaoUserInfo kakaoUser) {
    String email =
        kakaoUser.getEmail() != null
            ? kakaoUser.getEmail()
            : "kakao_" + kakaoUser.getId() + "@walkworld.app";

    User user =
        User.builder()
            .email(email)
            .kakaoId(kakaoUser.getId())
            .name(kakaoUser.getNickname() != null ? kakaoUser.getNickname() : "여행자")
            .avatarUrl(kakaoUser.getProfileImageUrl())
            .currentCityId("seoul")
            .build();
    userRepository.save(user);

    currencyRepository.save(
        UserCurrency.builder().userId(user.getId()).coupons(2).hearts(5).build());

    return user;
  }

  private User createGoogleUser(GoogleUserInfo googleUser) {
    String email =
        googleUser.getEmail() != null
            ? googleUser.getEmail()
            : "google_" + googleUser.getSub() + "@walkworld.app";

    User user =
        User.builder()
            .email(email)
            .googleId(googleUser.getSub())
            .name(googleUser.getName() != null ? googleUser.getName() : "여행자")
            .avatarUrl(googleUser.getPicture())
            .currentCityId("seoul")
            .build();
    userRepository.save(user);

    currencyRepository.save(
        UserCurrency.builder().userId(user.getId()).coupons(2).hearts(5).build());

    return user;
  }

  private boolean restoreOrRejectWithdrawnAccount(User user) {
    if (!user.isWithdrawn()) {
      return false;
    }

    LocalDateTime withdrawnAt = user.getWithdrawnAt();
    if (withdrawnAt != null
        && withdrawnAt.plusDays(WITHDRAWAL_GRACE_DAYS).isBefore(LocalDateTime.now())) {
      throw new AuthException(AuthErrorCode.ACCOUNT_WITHDRAWN_EXPIRED);
    }

    user.setStatus(UserStatus.active);
    user.setWithdrawnAt(null);
    userRepository.save(user);
    return true;
  }

  private TokenResDTO generateTokens(Long userId, boolean restored) {
    String accessToken = jwtProvider.createAccessToken(userId);
    String refreshToken = jwtProvider.createRefreshToken(userId);

    refreshTokenRepository.save(
        RefreshToken.builder()
            .userId(userId)
            .token(refreshToken)
            .expiresAt(
                LocalDateTime.now().plus(Duration.ofMillis(jwtProvider.getRefreshTokenExpiry())))
            .build());

    return TokenResDTO.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .expiresIn(3600L)
        .tokenType("Bearer")
        .restored(restored)
        .build();
  }
}
