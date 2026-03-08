package com.walkworld.api.domain.mission.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum MissionErrorCode implements BaseErrorCode {

    MISSION_NOT_FOUND(HttpStatus.NOT_FOUND, "MISSION_NOT_FOUND", "미션을 찾을 수 없습니다"),
    MISSION_LOCKED(HttpStatus.BAD_REQUEST, "MISSION_LOCKED", "아직 해금되지 않은 미션입니다"),
    ALREADY_COMPLETED(HttpStatus.BAD_REQUEST, "ALREADY_COMPLETED", "이미 완료된 미션입니다"),
    NOT_AI_MISSION(HttpStatus.BAD_REQUEST, "NOT_AI_MISSION", "AI 합성 대상이 아닌 미션입니다"),
    AI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "AI_SERVICE_UNAVAILABLE", "AI 서비스가 일시적으로 이용 불가합니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
