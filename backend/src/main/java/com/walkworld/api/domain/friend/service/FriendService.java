package com.walkworld.api.domain.friend.service;

import com.walkworld.api.domain.friend.dto.AddFriendRequest;
import com.walkworld.api.domain.friend.dto.FriendResponse;

import java.util.List;

public interface FriendService {
    List<FriendResponse> getFriends(Long userId);
    FriendResponse addFriend(Long userId, AddFriendRequest request);
    void removeFriend(Long userId, Long friendId);
}
