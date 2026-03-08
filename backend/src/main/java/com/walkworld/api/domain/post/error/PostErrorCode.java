package com.walkworld.api.domain.post.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum PostErrorCode implements BaseErrorCode {

    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "POST_NOT_FOUND", "게시물을 찾을 수 없습니다"),
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_NOT_FOUND", "댓글을 찾을 수 없습니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "FORBIDDEN", "본인의 게시물/댓글만 삭제할 수 있습니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
