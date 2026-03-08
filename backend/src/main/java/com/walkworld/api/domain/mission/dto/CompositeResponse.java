package com.walkworld.api.domain.mission.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CompositeResponse {
    private String missionId;
    private CompositeImage compositeImage;
    private LocalDateTime expiresAt;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CompositeImage {
        private String url;
        private String thumbnailUrl;
        private Integer width;
        private Integer height;
        private String prompt;
    }
}
