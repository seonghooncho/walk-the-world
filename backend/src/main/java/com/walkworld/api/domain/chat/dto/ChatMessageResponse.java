package com.walkworld.api.domain.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long senderId;
    private String content;
    private Boolean read;
    private LocalDateTime createdAt;
}
