package com.walkworld.api.domain.user.converter;

import com.walkworld.api.domain.currency.entity.UserCurrency;
import com.walkworld.api.domain.user.dto.UserProfileResponse;
import com.walkworld.api.domain.user.entity.User;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class UserConverter {

    public static UserProfileResponse toProfileResponse(
            User user, UserCurrency currency, int friendCount, String avatarUrl) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .avatarUrl(avatarUrl)
                .totalSteps(user.getTotalSteps())
                .currentCityId(user.getCurrentCityId())
                .coupons(currency != null ? currency.getCoupons() : 0)
                .hearts(currency != null ? currency.getHearts() : 0)
                .friendCount(friendCount)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
