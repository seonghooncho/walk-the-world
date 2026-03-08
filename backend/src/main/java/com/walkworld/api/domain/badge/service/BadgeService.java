package com.walkworld.api.domain.badge.service;

import com.walkworld.api.domain.badge.dto.BadgeListResponse;
import com.walkworld.api.domain.badge.dto.BadgeStatsResponse;

public interface BadgeService {
    BadgeListResponse getBadges(Long userId, String cityId, Boolean earned);
    BadgeStatsResponse getStats(Long userId);
    void awardBadge(Long userId, String missionId, String cityId, String title, String emoji);
}
