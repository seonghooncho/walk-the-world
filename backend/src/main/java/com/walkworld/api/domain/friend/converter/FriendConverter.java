package com.walkworld.api.domain.friend.converter;

import com.walkworld.api.domain.friend.dto.FriendResponse;
import com.walkworld.api.domain.friend.entity.Friendship;
import com.walkworld.api.domain.user.entity.User;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class FriendConverter {

    public static FriendResponse toFriendResponse(User friend, Friendship friendship) {
        return FriendResponse.builder()
                .id(friend.getId())
                .name(friend.getName())
                .avatarUrl(friend.getAvatarUrl())
                .totalSteps(friend.getTotalSteps())
                .currentCityId(friend.getCurrentCityId())
                .method(friendship.getMethod().name())
                .friendSince(friendship.getCreatedAt())
                .build();
    }

    public static FriendResponse toFriendResponse(User friend, String method) {
        return FriendResponse.builder()
                .id(friend.getId())
                .name(friend.getName())
                .avatarUrl(friend.getAvatarUrl())
                .totalSteps(friend.getTotalSteps())
                .currentCityId(friend.getCurrentCityId())
                .method(method)
                .build();
    }
}
