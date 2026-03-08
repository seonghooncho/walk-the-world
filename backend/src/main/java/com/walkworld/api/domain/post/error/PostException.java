package com.walkworld.api.domain.post.error;

import com.walkworld.api.global.error.CustomException;

public class PostException extends CustomException {
    public PostException(PostErrorCode errorCode) {
        super(errorCode);
    }
}
