package com.walkworld.api.domain.auth.controller;

import com.walkworld.api.domain.auth.dto.req.*;
import com.walkworld.api.domain.auth.dto.res.TokenResDTO;
import com.walkworld.api.domain.auth.service.AuthService;
import com.walkworld.api.domain.auth.service.KakaoOAuthService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/v1")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final KakaoOAuthService kakaoOAuthService;

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<TokenResDTO> signup(@Valid @RequestBody SignupReqDTO request) {
    return ApiResponse.ok(authService.signup(request));
  }

  @PostMapping("/login")
  public ApiResponse<TokenResDTO> login(@Valid @RequestBody LoginReqDTO request) {
    return ApiResponse.ok(authService.login(request));
  }

  @PostMapping("/refresh")
  public ApiResponse<TokenResDTO> refresh(@Valid @RequestBody RefreshReqDTO request) {
    return ApiResponse.ok(authService.refresh(request));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout(@Valid @RequestBody RefreshReqDTO request) {
    authService.logout(request);
    return ApiResponse.ok(null);
  }

  @PostMapping("/password/reset")
  public ApiResponse<Void> requestPasswordReset(@Valid @RequestBody PasswordResetReqDTO request) {
    authService.requestPasswordReset(request);
    return ApiResponse.ok(null);
  }

  @PutMapping("/password")
  public ApiResponse<Void> changePassword(
      @CurrentUserId Long userId, @Valid @RequestBody ChangePasswordReqDTO request) {
    authService.changePassword(userId, request);
    return ApiResponse.ok(null);
  }

  @PostMapping("/kakao")
  public ApiResponse<TokenResDTO> kakaoLogin(@Valid @RequestBody KakaoLoginReqDTO request) {
    return ApiResponse.ok(authService.kakaoLogin(request));
  }

  @GetMapping("/oauth/kakao/start")
  public ResponseEntity<Void> startKakaoOAuth(
      @RequestParam String frontendOrigin,
      @RequestParam(defaultValue = "/") String redirectPath,
      HttpServletRequest request) {
    URI redirectUri = kakaoOAuthService.buildAuthorizationUri(frontendOrigin, redirectPath, request);
    return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
  }

  @GetMapping("/oauth/kakao/callback")
  public ResponseEntity<Void> handleKakaoOAuthCallback(
      @RequestParam(required = false) String code,
      @RequestParam(required = false) String state,
      @RequestParam(required = false) String error,
      @RequestParam(name = "error_description", required = false) String errorDescription,
      HttpServletRequest request) {
    URI redirectUri =
        StringUtils.hasText(error)
            ? kakaoOAuthService.buildFailureRedirect(
                state, StringUtils.hasText(errorDescription) ? errorDescription : error)
            : kakaoOAuthService.buildCallbackRedirect(code, state, request);

    return ResponseEntity.status(HttpStatus.FOUND).location(redirectUri).build();
  }

  @PostMapping("/google")
  public ApiResponse<TokenResDTO> googleLogin(@Valid @RequestBody GoogleLoginReqDTO request) {
    return ApiResponse.ok(authService.googleLogin(request));
  }
}
