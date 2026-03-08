package com.walkworld.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class StepSyncResponse {
    private Long totalSteps;
    private String currentCityId;
    private String currentCityName;
    private String nextCityId;
    private String nextCityName;
    private Long stepsToNextCity;
    private Double progressPercent;
    private List<String> newlyUnlockedCities;
}
