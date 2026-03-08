package com.walkworld.api.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private String content;
    private LocalDateTime createdAt;
}
