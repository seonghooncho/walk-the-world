package com.walkworld.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String email;
    private String name;
    private String avatarUrl;
    private Long totalSteps;
    private String currentCityId;
    private Integer coupons;
    private Integer hearts;
    private Integer friendCount;
    private LocalDateTime createdAt;
}
