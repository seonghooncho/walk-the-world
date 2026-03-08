package com.walkworld.api.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class BadgeResponse {
    private String id;
    private String missionId;
    private String cityId;
    private String cityName;
    private String countryFlag;
    private String title;
    private String emoji;
    private String description;
    private Boolean earned;
    private LocalDateTime earnedAt;
}
