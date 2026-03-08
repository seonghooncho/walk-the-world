package com.walkworld.api.domain.mission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class MissionResponse {
    private String id;
    private String cityId;
    private String type;
    private String title;
    private String description;
    private String imageUrl;
    private Long stepsRequired;
    private String emoji;
    private String reward;
    private String status;
    private LocalDateTime completedAt;
    private Boolean aiComposite;
    private String aiPrompt;
}
