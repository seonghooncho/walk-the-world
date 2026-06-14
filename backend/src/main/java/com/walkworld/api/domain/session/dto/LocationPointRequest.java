package com.walkworld.api.domain.session.dto;

import java.time.OffsetDateTime;

public record LocationPointRequest(
    Double latitude, Double longitude, Double accuracyMeters, OffsetDateTime recordedAt) {}
