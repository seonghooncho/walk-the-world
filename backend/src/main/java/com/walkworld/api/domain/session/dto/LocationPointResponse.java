package com.walkworld.api.domain.session.dto;

public record LocationPointResponse(
    Long sessionId,
    Integer distanceMeters,
    Integer bonusMeters,
    Integer progressMeters,
    Integer progressPercent,
    Integer distanceAddedMeters) {}
