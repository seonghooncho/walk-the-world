package com.walkworld.api.domain.mission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class MissionStatsResponse {
    private Integer totalCompleted;
    private Integer totalMissions;
    private Map<String, CityStats> cities;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CityStats {
        private Integer completed;
        private Integer total;
    }
}
