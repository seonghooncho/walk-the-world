package com.walkworld.api.domain.user.service;

import com.walkworld.api.domain.user.dto.AvatarUploadResponse;
import com.walkworld.api.domain.user.dto.PublicProfileResponse;
import com.walkworld.api.domain.user.dto.UpdateProfileRequest;
import com.walkworld.api.domain.user.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    PublicProfileResponse getPublicProfile(Long currentUserId, Long targetUserId);
    AvatarUploadResponse uploadAvatar(Long userId, String imageKey);
}
