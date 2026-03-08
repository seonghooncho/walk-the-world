package com.walkworld.api.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class LikeResponse {
    private Boolean isLiked;
    private Long likesCount;
}
