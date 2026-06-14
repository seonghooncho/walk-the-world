package com.walkworld.api.domain.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SendMessageRequest {
    @NotBlank
    @Size(max = 500, message = "500자 이하로 입력해주세요")
    private String content;
}
