package com.walkworld.api.domain.auth.error;

import com.walkworld.api.global.error.CustomException;

public class AuthException extends CustomException {
    public AuthException(AuthErrorCode errorCode) {
        super(errorCode);
    }
}
