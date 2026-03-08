package com.walkworld.api.domain.chat.service;

import com.walkworld.api.domain.chat.dto.ChatMessageResponse;
import com.walkworld.api.domain.chat.dto.ChatRoomResponse;
import com.walkworld.api.global.response.ApiResponse;

import java.util.List;

public interface ChatService {
    List<ChatRoomResponse> getRooms(Long userId);
    ApiResponse<List<ChatMessageResponse>> getMessages(Long userId, Long roomId, String cursor, int limit);
    ChatMessageResponse sendMessage(Long userId, Long roomId, String content);
    void markAsRead(Long userId, Long roomId);
}
