package com.walkworld.api.domain.friend.controller;

import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.friend.dto.AddFriendRequest;
import com.walkworld.api.domain.friend.dto.FriendResponse;
import com.walkworld.api.domain.friend.service.FriendService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends/v1")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ApiResponse<List<FriendResponse>> getFriends(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(friendService.getFriends(userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<FriendResponse> addFriend(Authentication auth,
                                                  @Valid @RequestBody AddFriendRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(friendService.addFriend(userId, request));
    }

    @DeleteMapping("/{friendId}")
    public ApiResponse<Void> removeFriend(Authentication auth, @PathVariable Long friendId) {
        Long userId = (Long) auth.getPrincipal();
        friendService.removeFriend(userId, friendId);
        return ApiResponse.ok(null);
    }
}
