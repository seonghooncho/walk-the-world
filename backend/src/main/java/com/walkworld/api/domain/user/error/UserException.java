package com.walkworld.api.domain.user.error;

import com.walkworld.api.global.error.CustomException;

public class UserException extends CustomException {
    public UserException(UserErrorCode errorCode) {
        super(errorCode);
    }
}
