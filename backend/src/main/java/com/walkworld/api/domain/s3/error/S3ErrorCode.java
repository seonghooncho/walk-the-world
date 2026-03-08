package com.walkworld.api.domain.s3.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum S3ErrorCode implements BaseErrorCode {

    UNSUPPORTED_FILE_TYPE(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "UNSUPPORTED_FILE_TYPE",
            "지원하지 않는 파일 형식입니다 (jpg, png, webp만 허용)"),
    UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "UPLOAD_FAILED", "파일 업로드에 실패했습니다"),
    FILE_TOO_LARGE(HttpStatus.PAYLOAD_TOO_LARGE, "FILE_TOO_LARGE", "파일 크기는 10MB를 초과할 수 없습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
