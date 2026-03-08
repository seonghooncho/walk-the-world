package com.walkworld.api.domain.mission.controller;

import com.walkworld.api.domain.mission.dto.*;
import com.walkworld.api.domain.mission.service.MissionService;
import com.walkworld.api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions/v1")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @GetMapping
    public ApiResponse<Map<String, List<MissionResponse>>> getMissions(
            Authentication auth,
            @RequestParam(required = false) String cityId,
            @RequestParam(required = false) String status) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(missionService.getMissions(userId, cityId, status));
    }

    @PostMapping("/{missionId}/complete")
    public ApiResponse<MissionCompleteResponse> completeMission(
            Authentication auth,
            @PathVariable String missionId,
            @RequestBody MissionCompleteRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(missionService.completeMission(
                userId, missionId, request.getImageKey(), request.getText(), request.isAutoPost()));
    }

    @PostMapping("/{missionId}/composite")
    public ApiResponse<CompositeResponse> compositeImage(
            Authentication auth,
            @PathVariable String missionId,
            @RequestBody MissionCompositeRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(missionService.compositeImage(userId, missionId, request.getImageKey()));
    }

    @GetMapping("/stats")
    public ApiResponse<MissionStatsResponse> getStats(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(missionService.getStats(userId));
    }
}
