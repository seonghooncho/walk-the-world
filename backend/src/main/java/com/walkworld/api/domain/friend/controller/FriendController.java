package com.walkworld.api.domain.friend.controller;

import com.walkworld.api.domain.friend.dto.AddFriendRequest;
import com.walkworld.api.domain.friend.dto.FriendResponse;
import com.walkworld.api.domain.friend.service.FriendService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends/v1")
@RequiredArgsConstructor
public class FriendController {

  private final FriendService friendService;

  @GetMapping
  public ApiResponse<List<FriendResponse>> getFriends(@CurrentUserId Long userId) {
    return ApiResponse.ok(friendService.getFriends(userId));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<FriendResponse> addFriend(
      @CurrentUserId Long userId, @Valid @RequestBody AddFriendRequest request) {
    return ApiResponse.ok(friendService.addFriend(userId, request));
  }

  @DeleteMapping("/{friendId}")
  public ApiResponse<Void> removeFriend(@CurrentUserId Long userId, @PathVariable Long friendId) {
    friendService.removeFriend(userId, friendId);
    return ApiResponse.ok(null);
  }
}
