package com.walkworld.api.domain.user.controller;

import com.walkworld.api.domain.user.dto.StepHistoryResponse;
import com.walkworld.api.domain.user.dto.StepSyncRequest;
import com.walkworld.api.domain.user.dto.StepSyncResponse;
import com.walkworld.api.domain.user.service.StepService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/steps/v1")
@RequiredArgsConstructor
public class StepController {

  private final StepService stepService;

  @PostMapping("/sync")
  public ApiResponse<StepSyncResponse> sync(
      @CurrentUserId Long userId, @Valid @RequestBody StepSyncRequest request) {
    return ApiResponse.ok(stepService.syncSteps(userId, request));
  }

  @GetMapping
  public ApiResponse<StepSyncResponse> getSteps(@CurrentUserId Long userId) {
    return ApiResponse.ok(stepService.getStepInfo(userId));
  }

  @GetMapping("/history")
  public ApiResponse<StepHistoryResponse> getHistory(
      @CurrentUserId Long userId,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
      @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
    return ApiResponse.ok(stepService.getHistory(userId, from, to));
  }
}
