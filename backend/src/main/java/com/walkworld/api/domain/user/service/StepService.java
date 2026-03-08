package com.walkworld.api.domain.user.service;

import com.walkworld.api.domain.user.dto.StepSyncRequest;
import com.walkworld.api.domain.user.dto.StepSyncResponse;

public interface StepService {
    StepSyncResponse syncSteps(Long userId, StepSyncRequest request);
    StepSyncResponse getStepInfo(Long userId);
}
