package com.walkworld.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AvatarUploadResponse {
    private String avatarUrl;
}
