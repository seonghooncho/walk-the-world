package com.walkworld.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class PublicProfileResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private Long totalSteps;
    private String currentCityId;
    private Boolean isFriend;
    private LocalDateTime joinedAt;
}
