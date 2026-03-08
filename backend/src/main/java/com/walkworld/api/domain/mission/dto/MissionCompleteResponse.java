package com.walkworld.api.domain.mission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MissionCompleteResponse {
    private String missionId;
    private String status;
    private LocalDateTime completedAt;
    private String reward;
    private Long autoPostedId;
}
