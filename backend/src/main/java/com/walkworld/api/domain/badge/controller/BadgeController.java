package com.walkworld.api.domain.badge.controller;

import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.badge.dto.BadgeListResponse;
import com.walkworld.api.domain.badge.dto.BadgeStatsResponse;
import com.walkworld.api.domain.badge.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/badges/v1")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping
    public ApiResponse<BadgeListResponse> getBadges(
            Authentication auth,
            @RequestParam(required = false) String cityId,
            @RequestParam(required = false) Boolean earned) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(badgeService.getBadges(userId, cityId, earned));
    }

    @GetMapping("/stats")
    public ApiResponse<BadgeStatsResponse> getStats(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(badgeService.getStats(userId));
    }
}
