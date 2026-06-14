package com.walkworld.api.domain.session.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SessionErrorCode implements BaseErrorCode {
  SESSION_NOT_FOUND(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "산책 세션을 찾을 수 없습니다"),
  SESSION_ALREADY_FINISHED(HttpStatus.BAD_REQUEST, "SESSION_ALREADY_FINISHED", "이미 종료된 산책 세션입니다"),
  MISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "SESSION_MISSION_NOT_FOUND", "세션 미션을 찾을 수 없습니다"),
  MISSION_ALREADY_COMPLETED(HttpStatus.CONFLICT, "SESSION_MISSION_ALREADY_COMPLETED", "이미 완료한 세션 미션입니다"),
  INVALID_ACTIVITY_TYPE(HttpStatus.BAD_REQUEST, "INVALID_ACTIVITY_TYPE", "산책 또는 러닝만 시작할 수 있습니다"),
  INVALID_LOCATION(HttpStatus.BAD_REQUEST, "INVALID_LOCATION", "위치 정보가 올바르지 않습니다"),
  INVALID_PROOF(HttpStatus.BAD_REQUEST, "INVALID_PROOF", "미션 인증 정보가 부족합니다");

  private final HttpStatus httpStatus;
  private final String code;
  private final String message;
}
