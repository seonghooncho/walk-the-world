package com.walkworld.api.domain.session.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TodaySessionResponse(
    Long sessionId,
    LocalDate sessionDate,
    String status,
    String activityType,
    String cityId,
    String cityName,
    String countryFlag,
    Integer dailyGoalMeters,
    Integer distanceMeters,
    Integer bonusMeters,
    Integer progressMeters,
    Integer progressPercent,
    Integer durationSeconds,
    Integer ticketsEarned,
    Integer stampsEarned,
    String environmentHint,
    String playlistTitle,
    String playlistUrl,
    LocalDateTime startedAt,
    LocalDateTime endedAt,
    List<SessionMissionResponse> missions) {}
