package com.walkworld.api.domain.s3.error;

import com.walkworld.api.global.error.CustomException;

public class S3Exception extends CustomException {
    public S3Exception(S3ErrorCode errorCode) {
        super(errorCode);
    }
}
