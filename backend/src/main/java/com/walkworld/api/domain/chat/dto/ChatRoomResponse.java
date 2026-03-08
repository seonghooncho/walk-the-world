package com.walkworld.api.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ChatRoomResponse {
    private Long id;
    private Long friendId;
    private String friendName;
    private String friendAvatar;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private Long unreadCount;
}
