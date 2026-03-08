package com.walkworld.api.domain.friend.error;

import com.walkworld.api.global.error.CustomException;

public class FriendException extends CustomException {
    public FriendException(FriendErrorCode errorCode) {
        super(errorCode);
    }
}
