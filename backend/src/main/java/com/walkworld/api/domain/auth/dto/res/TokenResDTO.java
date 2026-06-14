package com.walkworld.api.domain.auth.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class TokenResDTO {
    private String accessToken;
    private String refreshToken;
    private Long expiresIn;
    private String tokenType;
    @Builder.Default
    private Boolean restored = false;
}
