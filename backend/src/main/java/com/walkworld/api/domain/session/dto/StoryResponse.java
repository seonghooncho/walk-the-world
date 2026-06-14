package com.walkworld.api.domain.session.dto;

import java.time.LocalDateTime;

public record StoryResponse(
    Long id,
    Long userId,
    String userName,
    String userAvatarUrl,
    String cityId,
    String missionTitle,
    String content,
    String imageUrl,
    String imageKey,
    LocalDateTime createdAt) {}
