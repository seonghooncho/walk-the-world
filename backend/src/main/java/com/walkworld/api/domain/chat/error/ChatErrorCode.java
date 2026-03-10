package com.walkworld.api.domain.chat.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ChatErrorCode implements BaseErrorCode {
  CHAT_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "CHAT404", "채팅방을 찾을 수 없습니다"),
  CHAT_FORBIDDEN(HttpStatus.FORBIDDEN, "CHAT403", "채팅을 시작할 수 없습니다"),
  SELF_CHAT_NOT_ALLOWED(HttpStatus.BAD_REQUEST, "CHAT400", "자기 자신과는 채팅할 수 없습니다");

  private final HttpStatus httpStatus;
  private final String code;
  private final String message;
}
