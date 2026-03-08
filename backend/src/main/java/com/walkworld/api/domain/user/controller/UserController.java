package com.walkworld.api.domain.user.controller;

import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.user.dto.AvatarUploadResponse;
import com.walkworld.api.domain.user.dto.PublicProfileResponse;
import com.walkworld.api.domain.user.dto.UserProfileResponse;
import com.walkworld.api.domain.user.dto.UpdateProfileRequest;
import com.walkworld.api.domain.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/v1")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMe(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getProfile(userId));
    }

    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> updateMe(Authentication auth,
                                                      @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.updateProfile(userId, request));
    }

    @GetMapping("/{targetUserId}")
    public ApiResponse<PublicProfileResponse> getPublicProfile(Authentication auth,
                                                                @PathVariable Long targetUserId) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.getPublicProfile(userId, targetUserId));
    }

    @PostMapping("/me/avatar")
    public ApiResponse<AvatarUploadResponse> uploadAvatar(Authentication auth,
                                                           @RequestParam String imageKey) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(userService.uploadAvatar(userId, imageKey));
    }
}
