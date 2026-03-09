package com.walkworld.api.domain.user.service;

import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.converter.UserConverter;
import com.walkworld.api.domain.user.dto.AvatarUploadResponse;
import com.walkworld.api.domain.user.dto.PublicProfileResponse;
import com.walkworld.api.domain.user.dto.UpdateProfileRequest;
import com.walkworld.api.domain.user.dto.UserProfileResponse;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

  private final UserRepository userRepository;
  private final UserCurrencyRepository currencyRepository;
  private final FriendshipRepository friendshipRepository;
  private final S3Service s3Service;

  public UserProfileResponse getProfile(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    var currency = currencyRepository.findById(userId).orElse(null);
    int friendCount = friendshipRepository.findFriendIdsByUserId(userId).size();

    return UserConverter.toProfileResponse(user, currency, friendCount);
  }

  @Transactional
  public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    if (request.getName() != null) user.setName(request.getName());
    if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

    userRepository.save(user);
    return getProfile(userId);
  }

  public PublicProfileResponse getPublicProfile(Long currentUserId, Long targetUserId) {
    User target =
        userRepository
            .findById(targetUserId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    boolean isFriend = friendshipRepository.existsByUserIdAndFriendId(currentUserId, targetUserId);

    return PublicProfileResponse.builder()
        .id(target.getId())
        .name(target.getName())
        .avatarUrl(target.getAvatarUrl())
        .totalSteps(target.getTotalSteps())
        .currentCityId(target.getCurrentCityId())
        .isFriend(isFriend)
        .joinedAt(target.getCreatedAt())
        .build();
  }

  @Transactional
  public AvatarUploadResponse uploadAvatar(Long userId, String imageKey) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    String avatarUrl = s3Service.generateDownloadUrl(imageKey);
    user.setAvatarUrl(imageKey);
    userRepository.save(user);

    return AvatarUploadResponse.builder().avatarUrl(avatarUrl).build();
  }
}
