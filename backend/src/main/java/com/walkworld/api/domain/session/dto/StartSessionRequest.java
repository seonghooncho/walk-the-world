package com.walkworld.api.domain.session.dto;

public record StartSessionRequest(
    String activityType, GeoPointRequest startLocation, String environmentHint, String playlistId) {}
