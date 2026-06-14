package com.walkworld.api.domain.session.dto;

public record FinishSessionResponse(
    Long sessionId,
    String status,
    Integer distanceMeters,
    Integer bonusMeters,
    Integer progressMeters,
    Integer progressPercent,
    Integer durationSeconds,
    Integer ticketsEarned,
    Integer stampsEarned,
    Boolean couponExchangeAvailable) {}
