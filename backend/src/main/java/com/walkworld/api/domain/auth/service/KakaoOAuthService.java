package com.walkworld.api.domain.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.walkworld.api.domain.auth.dto.req.KakaoLoginReqDTO;
import com.walkworld.api.domain.auth.dto.res.TokenResDTO;
import com.walkworld.api.domain.auth.error.AuthErrorCode;
import com.walkworld.api.domain.auth.error.AuthException;
import com.walkworld.api.global.config.JwtProperties;
import com.walkworld.api.global.config.OAuthProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Arrays;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private static final Duration STATE_TTL = Duration.ofMinutes(10);
    private static final String CALLBACK_PATH = "/auth/callback";

    private final OAuthProperties oauthProperties;
    private final JwtProperties jwtProperties;
    private final AuthService authService;

    private final RestClient restClient = RestClient.builder().build();

    public URI buildAuthorizationUri(String frontendOrigin, String redirectPath, HttpServletRequest request) {
        OAuthProperties.Kakao config = oauthProperties.getKakao();
        ensureConfigured(config);

        String normalizedFrontendOrigin = normalizeFrontendOrigin(frontendOrigin);
        String normalizedRedirectPath = normalizeRedirectPath(redirectPath);
        validateFrontendOrigin(normalizedFrontendOrigin);
        String callbackUri = buildApiBaseUrl(request) + "/api/auth/v1/oauth/kakao/callback";
        String state = createState(normalizedFrontendOrigin, normalizedRedirectPath);

        return UriComponentsBuilder
                .fromUriString("https://kauth.kakao.com/oauth/authorize")
                .queryParam("response_type", "code")
                .queryParam("client_id", config.getClientId())
                .queryParam("redirect_uri", callbackUri)
                .queryParam("state", state)
                .build(true)
                .toUri();
    }

    public URI buildCallbackRedirect(String code, String stateToken, HttpServletRequest request) {
        OAuthState state = parseState(stateToken);
        OAuthProperties.Kakao config = oauthProperties.getKakao();
        ensureConfigured(config);

        String callbackUri = buildApiBaseUrl(request) + "/api/auth/v1/oauth/kakao/callback";
        String kakaoAccessToken = exchangeCodeForAccessToken(config, code, callbackUri);

        KakaoLoginReqDTO loginRequest = new KakaoLoginReqDTO();
        loginRequest.setAccessToken(kakaoAccessToken);
        TokenResDTO tokens = authService.kakaoLogin(loginRequest);

        String destination = state.frontendOrigin() + CALLBACK_PATH
                + "#accessToken=" + encode(tokens.getAccessToken())
                + "&refreshToken=" + encode(tokens.getRefreshToken())
                + "&redirect=" + encode(state.redirectPath())
                + "&provider=kakao";

        return URI.create(destination);
    }

    public URI buildFailureRedirect(String stateToken, String errorMessage) {
        OAuthState state = parseStateOrNull(stateToken);
        if (state == null) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }

        if (isAppOrigin(state.frontendOrigin())) {
            return UriComponentsBuilder
                    .fromUriString(state.frontendOrigin() + CALLBACK_PATH)
                    .queryParam("redirect", state.redirectPath())
                    .queryParam("error", "kakao")
                    .queryParam("message", errorMessage)
                    .build(true)
                    .toUri();
        }

        return UriComponentsBuilder
                .fromUriString(state.frontendOrigin() + "/login")
                .queryParam("redirect", state.redirectPath())
                .queryParam("error", "kakao")
                .queryParam("message", errorMessage)
                .build(true)
                .toUri();
    }

    private String exchangeCodeForAccessToken(OAuthProperties.Kakao config, String code, String callbackUri) {
        if (!StringUtils.hasText(code)) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", config.getClientId());
        form.add("redirect_uri", callbackUri);
        form.add("code", code);
        if (StringUtils.hasText(config.getClientSecret())) {
            form.add("client_secret", config.getClientSecret());
        }

        JsonNode tokenResponse = restClient.post()
                .uri("https://kauth.kakao.com/oauth/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(JsonNode.class);

        String accessToken = tokenResponse != null ? tokenResponse.path("access_token").asText("") : "";
        if (!StringUtils.hasText(accessToken)) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }

        return accessToken;
    }

    private String createState(String frontendOrigin, String redirectPath) {
        return Jwts.builder()
                .subject("kakao-oauth-state")
                .claim("frontendOrigin", frontendOrigin)
                .claim("redirectPath", redirectPath)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + STATE_TTL.toMillis()))
                .signWith(signingKey())
                .compact();
    }

    private OAuthState parseState(String stateToken) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey())
                    .build()
                    .parseSignedClaims(stateToken)
                    .getPayload();

            return new OAuthState(
                    normalizeFrontendOrigin(claims.get("frontendOrigin", String.class)),
                    normalizeRedirectPath(claims.get("redirectPath", String.class))
            );
        } catch (Exception exception) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }
    }

    private OAuthState parseStateOrNull(String stateToken) {
        if (!StringUtils.hasText(stateToken)) {
            return null;
        }

        try {
            return parseState(stateToken);
        } catch (AuthException exception) {
            return null;
        }
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    private void ensureConfigured(OAuthProperties.Kakao config) {
        if (!StringUtils.hasText(config.getClientId())) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }
    }

    private String buildApiBaseUrl(HttpServletRequest request) {
        if (StringUtils.hasText(oauthProperties.getPublicApiBaseUrl())) {
            return normalizeFrontendOrigin(oauthProperties.getPublicApiBaseUrl());
        }

        return UriComponentsBuilder
                .fromHttpUrl(request.getRequestURL().toString())
                .replacePath(null)
                .replaceQuery(null)
                .build()
                .toUriString();
    }

    private String normalizeFrontendOrigin(String frontendOrigin) {
        String trimmed = decodeRepeatedly(frontendOrigin == null ? "" : frontendOrigin.trim());
        if (!StringUtils.hasText(trimmed)) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }

        String normalized = trimTrailingSlash(trimmed);
        try {
            URI origin = URI.create(normalized);
            String scheme = origin.getScheme();
            if (!StringUtils.hasText(scheme)
                    || !normalized.contains("://")
                    || StringUtils.hasText(origin.getRawQuery())
                    || StringUtils.hasText(origin.getRawFragment())) {
                throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
            }

            if ("http".equalsIgnoreCase(scheme) || "https".equalsIgnoreCase(scheme)) {
                String authority = origin.getRawAuthority();
                if (!StringUtils.hasText(authority)) {
                    throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
                }
                return scheme.toLowerCase() + "://" + authority;
            }

            return normalized;
        } catch (IllegalArgumentException exception) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }
    }

    private void validateFrontendOrigin(String frontendOrigin) {
        String[] allowedOrigins = allowedFrontendOrigins();
        if (allowedOrigins.length == 0) {
            return;
        }

        boolean matched = Arrays.stream(allowedOrigins)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(this::normalizeFrontendOrigin)
                .anyMatch(frontendOrigin::equals);

        if (!matched) {
            throw new AuthException(AuthErrorCode.KAKAO_AUTH_FAILED);
        }
    }

    private String[] allowedFrontendOrigins() {
        if (!StringUtils.hasText(oauthProperties.getAllowedFrontendOrigins())) {
            return new String[0];
        }

        return Arrays.stream(oauthProperties.getAllowedFrontendOrigins().split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toArray(String[]::new);
    }

    private boolean isAppOrigin(String frontendOrigin) {
        try {
            URI origin = URI.create(frontendOrigin);
            String scheme = origin.getScheme();
            return StringUtils.hasText(scheme)
                    && !"http".equalsIgnoreCase(scheme)
                    && !"https".equalsIgnoreCase(scheme);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private String trimTrailingSlash(String value) {
        if (!value.endsWith("/")) {
            return value;
        }

        if (value.endsWith("://") || value.endsWith(":///")) {
            return value;
        }

        int schemeDelimiterIndex = value.indexOf("://");
        if (schemeDelimiterIndex < 0) {
            return value.substring(0, value.length() - 1);
        }

        return value.substring(0, value.length() - 1);
    }

    private String normalizeRedirectPath(String redirectPath) {
        if (!StringUtils.hasText(redirectPath)) {
            return "/";
        }

        String trimmed = decodeRepeatedly(redirectPath.trim());
        if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
            return "/";
        }

        return trimmed;
    }

    private String decodeRepeatedly(String value) {
        String decoded = value;
        for (int i = 0; i < 2 && decoded.contains("%"); i++) {
            String next = URLDecoder.decode(decoded, StandardCharsets.UTF_8);
            if (next.equals(decoded)) {
                break;
            }
            decoded = next;
        }
        return decoded;
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private record OAuthState(String frontendOrigin, String redirectPath) {}
}
