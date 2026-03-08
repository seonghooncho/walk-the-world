package com.walkworld.api.domain.auth.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum AuthErrorCode implements BaseErrorCode {

    INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "이미 사용 중인 이메일입니다"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED", "토큰이 만료되었습니다"),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "유효하지 않은 토큰입니다"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "인증이 필요합니다"),
    PASSWORD_MISMATCH(HttpStatus.BAD_REQUEST, "PASSWORD_MISMATCH", "현재 비밀번호가 올바르지 않습니다"),
    KAKAO_AUTH_FAILED(HttpStatus.BAD_REQUEST, "KAKAO_AUTH_FAILED", "카카오 인증에 실패했습니다"),
    GOOGLE_AUTH_FAILED(HttpStatus.BAD_REQUEST, "GOOGLE_AUTH_FAILED", "구글 인증에 실패했습니다"),
    SOCIAL_ACCOUNT_NO_PASSWORD(HttpStatus.BAD_REQUEST, "SOCIAL_ACCOUNT_NO_PASSWORD", "소셜 로그인 계정은 비밀번호를 변경할 수 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
