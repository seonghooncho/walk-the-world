package com.walkworld.api.domain.session.controller;

import com.walkworld.api.domain.session.dto.*;
import com.walkworld.api.domain.session.service.WalkSessionService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions/v1")
@RequiredArgsConstructor
public class WalkSessionController {

  private final WalkSessionService walkSessionService;

  @GetMapping("/today")
  public ApiResponse<TodaySessionResponse> getToday(@CurrentUserId Long userId) {
    return ApiResponse.ok(walkSessionService.getToday(userId));
  }

  @PostMapping
  public ApiResponse<TodaySessionResponse> startSession(
      @CurrentUserId Long userId, @RequestBody StartSessionRequest request) {
    return ApiResponse.ok(walkSessionService.startSession(userId, request));
  }

  @PostMapping("/{sessionId}/locations")
  public ApiResponse<LocationPointResponse> recordLocation(
      @CurrentUserId Long userId,
      @PathVariable Long sessionId,
      @RequestBody LocationPointRequest request) {
    return ApiResponse.ok(walkSessionService.recordLocation(userId, sessionId, request));
  }

  @PostMapping("/{sessionId}/missions/{missionId}/proof")
  public ApiResponse<MissionProofResponse> submitMissionProof(
      @CurrentUserId Long userId,
      @PathVariable Long sessionId,
      @PathVariable Long missionId,
      @RequestBody MissionProofRequest request) {
    return ApiResponse.ok(walkSessionService.submitMissionProof(userId, sessionId, missionId, request));
  }

  @PostMapping("/{sessionId}/finish")
  public ApiResponse<FinishSessionResponse> finishSession(
      @CurrentUserId Long userId, @PathVariable Long sessionId) {
    return ApiResponse.ok(walkSessionService.finishSession(userId, sessionId));
  }

  @GetMapping("/stories/friends")
  public ApiResponse<List<StoryResponse>> getFriendStories(
      @CurrentUserId Long userId, @RequestParam(defaultValue = "20") int limit) {
    return walkSessionService.getFriendStories(userId, limit);
  }
}
