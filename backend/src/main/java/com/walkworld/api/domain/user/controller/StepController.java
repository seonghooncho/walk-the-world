package com.walkworld.api.domain.user.controller;

import com.walkworld.api.domain.user.dto.StepHistoryResponse;
import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.user.dto.StepSyncRequest;
import com.walkworld.api.domain.user.dto.StepSyncResponse;
import com.walkworld.api.domain.user.service.StepService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/steps/v1")
@RequiredArgsConstructor
public class StepController {

    private final StepService stepService;

    @PostMapping("/sync")
    public ApiResponse<StepSyncResponse> sync(Authentication auth,
                                               @Valid @RequestBody StepSyncRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(stepService.syncSteps(userId, request));
    }

    @GetMapping
    public ApiResponse<StepSyncResponse> getSteps(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(stepService.getStepInfo(userId));
    }

    @GetMapping("/history")
    public ApiResponse<StepHistoryResponse> getHistory(
            Authentication auth,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(stepService.getHistory(userId, from, to));
    }
}
