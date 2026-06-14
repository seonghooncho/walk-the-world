package com.walkworld.api.domain.user.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements BaseErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다"),
    ACCOUNT_WITHDRAWN(HttpStatus.UNAUTHORIZED, "ACCOUNT_WITHDRAWN", "탈퇴 처리된 계정입니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "권한이 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
