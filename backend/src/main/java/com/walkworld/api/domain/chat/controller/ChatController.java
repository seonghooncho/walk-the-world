package com.walkworld.api.domain.chat.controller;

import com.walkworld.api.domain.chat.dto.ChatMessageResponse;
import com.walkworld.api.domain.chat.dto.ChatRoomResponse;
import com.walkworld.api.domain.chat.dto.SendMessageRequest;
import com.walkworld.api.domain.chat.service.ChatService;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat/v1")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomResponse>> getRooms(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(chatService.getRooms(userId));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            Authentication auth,
            @PathVariable Long roomId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "50") int limit) {
        Long userId = (Long) auth.getPrincipal();
        return chatService.getMessages(userId, roomId, cursor, Math.min(limit, 100));
    }

    @PostMapping("/rooms/{roomId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ChatMessageResponse> sendMessage(
            Authentication auth,
            @PathVariable Long roomId,
            @Valid @RequestBody SendMessageRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(chatService.sendMessage(userId, roomId, request.getContent()));
    }

    @PostMapping("/rooms/{roomId}/read")
    public ApiResponse<Void> markAsRead(Authentication auth, @PathVariable Long roomId) {
        Long userId = (Long) auth.getPrincipal();
        chatService.markAsRead(userId, roomId);
        return ApiResponse.ok(null);
    }
}
