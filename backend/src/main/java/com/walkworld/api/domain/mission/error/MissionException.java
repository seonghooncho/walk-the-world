package com.walkworld.api.domain.mission.error;

import com.walkworld.api.global.error.CustomException;

public class MissionException extends CustomException {
    public MissionException(MissionErrorCode errorCode) {
        super(errorCode);
    }
}
