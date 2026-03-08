package com.walkworld.api.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class BadgeStatsResponse {
    private Integer totalEarned;
    private Integer totalPossible;
    private Map<String, CityBadgeStats> cities;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CityBadgeStats {
        private Integer earned;
        private Integer total;
    }
}
