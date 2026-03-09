package com.walkworld.api.domain.mission.controller;

import com.walkworld.api.domain.mission.dto.*;
import com.walkworld.api.domain.mission.service.MissionService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/missions/v1")
@RequiredArgsConstructor
public class MissionController {

  private final MissionService missionService;

  @GetMapping
  public ApiResponse<Map<String, List<MissionResponse>>> getMissions(
      @CurrentUserId Long userId,
      @RequestParam(required = false) String cityId,
      @RequestParam(required = false) String status) {
    return ApiResponse.ok(missionService.getMissions(userId, cityId, status));
  }

  @PostMapping("/{missionId}/complete")
  public ApiResponse<MissionCompleteResponse> completeMission(
      @CurrentUserId Long userId,
      @PathVariable String missionId,
      @RequestBody MissionCompleteRequest request) {
    return ApiResponse.ok(
        missionService.completeMission(
            userId, missionId, request.getImageKey(), request.getText(), request.isAutoPost()));
  }

  @PostMapping("/{missionId}/composite")
  public ApiResponse<CompositeResponse> compositeImage(
      @CurrentUserId Long userId,
      @PathVariable String missionId,
      @RequestBody MissionCompositeRequest request) {
    return ApiResponse.ok(missionService.compositeImage(userId, missionId, request.getImageKey()));
  }

  @GetMapping("/stats")
  public ApiResponse<MissionStatsResponse> getStats(@CurrentUserId Long userId) {
    return ApiResponse.ok(missionService.getStats(userId));
  }
}
