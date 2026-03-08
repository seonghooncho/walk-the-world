package com.walkworld.api.domain.friend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class FriendResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private Long totalSteps;
    private String currentCityId;
    private String method;
    private LocalDateTime friendSince;
}
