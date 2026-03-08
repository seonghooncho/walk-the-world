package com.walkworld.api.domain.city.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CityMemberResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private Long totalSteps;
    private Boolean isFriend;
}
