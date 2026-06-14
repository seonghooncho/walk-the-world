package com.walkworld.api.domain.friend.converter;

import com.walkworld.api.domain.friend.dto.FriendResponse;
import com.walkworld.api.domain.friend.entity.Friendship;
import com.walkworld.api.domain.user.entity.User;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class FriendConverter {

    public static FriendResponse toFriendResponse(
            User friend, Friendship friendship, String avatarUrl) {
        return FriendResponse.builder()
                .id(friend.getId())
                .name(friend.isActive() ? friend.getName() : "탈퇴한 사용자")
                .avatarUrl(friend.isActive() ? avatarUrl : null)
                .totalSteps(friend.getTotalSteps())
                .currentCityId(friend.getCurrentCityId())
                .method(friendship.getMethod().name())
                .friendSince(friendship.getCreatedAt())
                .build();
    }

    public static FriendResponse toFriendResponse(User friend, String method, String avatarUrl) {
        return FriendResponse.builder()
                .id(friend.getId())
                .name(friend.isActive() ? friend.getName() : "탈퇴한 사용자")
                .avatarUrl(friend.isActive() ? avatarUrl : null)
                .totalSteps(friend.getTotalSteps())
                .currentCityId(friend.getCurrentCityId())
                .method(method)
                .build();
    }
}
