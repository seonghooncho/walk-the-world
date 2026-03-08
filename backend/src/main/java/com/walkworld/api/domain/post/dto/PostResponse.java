package com.walkworld.api.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private String cityId;
    private String content;
    private ImageDetail image;
    private Long likes;
    private Long comments;
    private Boolean isLiked;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @AllArgsConstructor
    public static class ImageDetail {
        /** Pre-signed download URL (임시, 1시간 유효) */
        private String url;
        /** S3 key (클라이언트 캐싱용) */
        private String key;
    }
}
