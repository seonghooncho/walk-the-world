package com.walkworld.api.domain.badge.controller;

import com.walkworld.api.domain.badge.dto.BadgeListResponse;
import com.walkworld.api.domain.badge.dto.BadgeStatsResponse;
import com.walkworld.api.domain.badge.service.BadgeService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/badges/v1")
@RequiredArgsConstructor
public class BadgeController {

  private final BadgeService badgeService;

  @GetMapping
  public ApiResponse<BadgeListResponse> getBadges(
      @CurrentUserId Long userId,
      @RequestParam(required = false) String cityId,
      @RequestParam(required = false) Boolean earned) {
    return ApiResponse.ok(badgeService.getBadges(userId, cityId, earned));
  }

  @GetMapping("/stats")
  public ApiResponse<BadgeStatsResponse> getStats(@CurrentUserId Long userId) {
    return ApiResponse.ok(badgeService.getStats(userId));
  }
}
