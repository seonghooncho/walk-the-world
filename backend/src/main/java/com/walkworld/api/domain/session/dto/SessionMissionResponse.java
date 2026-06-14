package com.walkworld.api.domain.session.dto;

import java.time.LocalDateTime;

public record SessionMissionResponse(
    Long id,
    String missionKey,
    String title,
    String description,
    String proofType,
    String emoji,
    Integer bonusMeters,
    String stampReward,
    String status,
    String verificationStatus,
    String imageUrl,
    LocalDateTime completedAt) {}
