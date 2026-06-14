package com.walkworld.api.domain.user.controller;

import com.walkworld.api.domain.user.dto.AvatarUploadResponse;
import com.walkworld.api.domain.user.dto.PublicProfileResponse;
import com.walkworld.api.domain.user.dto.UpdateProfileRequest;
import com.walkworld.api.domain.user.dto.UserProfileResponse;
import com.walkworld.api.domain.user.service.UserService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/v1")
@RequiredArgsConstructor
public class UserController {

  private final UserService userService;

  @GetMapping("/me")
  public ApiResponse<UserProfileResponse> getMe(@CurrentUserId Long userId) {
    return ApiResponse.ok(userService.getProfile(userId));
  }

  @PatchMapping("/me")
  public ApiResponse<UserProfileResponse> updateMe(
      @CurrentUserId Long userId, @Valid @RequestBody UpdateProfileRequest request) {
    return ApiResponse.ok(userService.updateProfile(userId, request));
  }

  @GetMapping("/{targetUserId}")
  public ApiResponse<PublicProfileResponse> getPublicProfile(
      @CurrentUserId Long userId, @PathVariable Long targetUserId) {
    return ApiResponse.ok(userService.getPublicProfile(userId, targetUserId));
  }

  @PostMapping("/me/avatar")
  public ApiResponse<AvatarUploadResponse> uploadAvatar(
      @CurrentUserId Long userId, @RequestParam String imageKey) {
    return ApiResponse.ok(userService.uploadAvatar(userId, imageKey));
  }

  @DeleteMapping("/me")
  public ApiResponse<Void> withdrawMe(@CurrentUserId Long userId) {
    userService.withdrawAccount(userId);
    return ApiResponse.ok(null);
  }
}
