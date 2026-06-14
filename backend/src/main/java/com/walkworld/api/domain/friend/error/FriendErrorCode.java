package com.walkworld.api.domain.friend.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum FriendErrorCode implements BaseErrorCode {

    ALREADY_FRIENDS(HttpStatus.BAD_REQUEST, "ALREADY_FRIENDS", "이미 친구입니다"),
    SELF_FRIEND_REQUEST(HttpStatus.BAD_REQUEST, "SELF_FRIEND_REQUEST", "자기 자신에게 친구 요청을 보낼 수 없습니다"),
    FRIEND_NOT_FOUND(HttpStatus.NOT_FOUND, "FRIEND_NOT_FOUND", "사용자를 찾을 수 없습니다"),
    INVALID_FRIEND_METHOD(HttpStatus.BAD_REQUEST, "INVALID_FRIEND_METHOD", "지원하지 않는 친구 추가 방식입니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
