package com.walkworld.api.domain.session.dto;

public record MissionProofResponse(
    Long missionId,
    String status,
    String verificationStatus,
    Integer bonusMeters,
    Integer progressMeters,
    Integer progressPercent,
    Long storyId) {}
