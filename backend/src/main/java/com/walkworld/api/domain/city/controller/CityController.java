package com.walkworld.api.domain.city.controller;

import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.city.dto.CityResponse;
import com.walkworld.api.domain.city.dto.CityMemberResponse;
import com.walkworld.api.domain.city.service.CityService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities/v1")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    @GetMapping
    public ApiResponse<List<CityResponse>> getCities() {
        return ApiResponse.ok(cityService.getAllCities());
    }

    @GetMapping("/{cityId}")
    public ApiResponse<CityResponse> getCity(@PathVariable String cityId) {
        return ApiResponse.ok(cityService.getCity(cityId));
    }

    @GetMapping("/{cityId}/members")
    public ApiResponse<List<CityMemberResponse>> getMembers(
            Authentication auth,
            @PathVariable String cityId) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(cityService.getCityMembers(cityId, userId));
    }
}
