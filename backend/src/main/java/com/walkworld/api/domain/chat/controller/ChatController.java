package com.walkworld.api.domain.chat.controller;

import com.walkworld.api.domain.chat.dto.ChatMessageResponse;
import com.walkworld.api.domain.chat.dto.ChatRoomResponse;
import com.walkworld.api.domain.chat.dto.CreateChatRoomRequest;
import com.walkworld.api.domain.chat.dto.SendMessageRequest;
import com.walkworld.api.domain.chat.service.ChatService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat/v1")
@RequiredArgsConstructor
public class ChatController {

  private final ChatService chatService;

  @GetMapping("/rooms")
  public ApiResponse<List<ChatRoomResponse>> getRooms(@CurrentUserId Long userId) {
    return ApiResponse.ok(chatService.getRooms(userId));
  }

  @PostMapping("/rooms")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ChatRoomResponse> getOrCreateRoom(
      @CurrentUserId Long userId, @Valid @RequestBody CreateChatRoomRequest request) {
    return ApiResponse.ok(chatService.getOrCreateRoom(userId, request.getFriendId()));
  }

  @GetMapping("/rooms/{roomId}/messages")
  public ApiResponse<List<ChatMessageResponse>> getMessages(
      @CurrentUserId Long userId,
      @PathVariable Long roomId,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "50") int limit) {
    return chatService.getMessages(userId, roomId, cursor, clampLimit(limit));
  }

  @PostMapping("/rooms/{roomId}/messages")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<ChatMessageResponse> sendMessage(
      @CurrentUserId Long userId,
      @PathVariable Long roomId,
      @Valid @RequestBody SendMessageRequest request) {
    return ApiResponse.ok(chatService.sendMessage(userId, roomId, request.getContent()));
  }

  @PostMapping("/rooms/{roomId}/read")
  public ApiResponse<Void> markAsRead(@CurrentUserId Long userId, @PathVariable Long roomId) {
    chatService.markAsRead(userId, roomId);
    return ApiResponse.ok(null);
  }

  private int clampLimit(int limit) {
    return Math.max(1, Math.min(limit, 100));
  }
}
