package com.walkworld.api.domain.mission.service;

import com.walkworld.api.domain.mission.dto.*;

import java.util.List;
import java.util.Map;

public interface MissionService {
    Map<String, List<MissionResponse>> getMissions(Long userId, String cityId, String status);
    MissionCompleteResponse completeMission(Long userId, String missionId, String imageKey, String text, boolean autoPost);
    CompositeResponse compositeImage(Long userId, String missionId, String imageKey);
    MissionStatsResponse getStats(Long userId);
}
