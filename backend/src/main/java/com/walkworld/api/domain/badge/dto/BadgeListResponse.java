package com.walkworld.api.domain.badge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
public class BadgeListResponse {
    private Integer totalEarned;
    private Integer totalPossible;
    private List<BadgeResponse> badges;
}
