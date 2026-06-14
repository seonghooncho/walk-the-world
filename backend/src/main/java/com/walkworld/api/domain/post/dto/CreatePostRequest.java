package com.walkworld.api.domain.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {
    @NotBlank
    @Size(max = 500, message = "500자 이하로 입력해주세요")
    private String content;
    private String cityId;
    /** S3 object key (클라이언트가 pre-signed URL로 업로드 후 전달) */
    private String imageKey;
}
