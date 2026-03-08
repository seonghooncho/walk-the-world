package com.walkworld.api.domain.auth.dto.res;

import lombok.Data;

@Data
public class KakaoUserInfo {
    private Long id;
    private String email;
    private String nickname;
    private String profileImageUrl;
}
