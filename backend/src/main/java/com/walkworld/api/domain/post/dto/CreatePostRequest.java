package com.walkworld.api.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreatePostRequest {
    @NotBlank
    private String content;
    private String cityId;
    /** S3 object key (클라이언트가 pre-signed URL로 업로드 후 전달) */
    private String imageKey;
}
