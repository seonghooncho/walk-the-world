package com.walkworld.api.domain.auth.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class KakaoLoginReqDTO {
    @NotBlank
    private String accessToken;
}
