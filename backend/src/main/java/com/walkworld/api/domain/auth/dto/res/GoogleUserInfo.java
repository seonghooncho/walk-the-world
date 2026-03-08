package com.walkworld.api.domain.auth.dto.res;

import lombok.Data;

@Data
public class GoogleUserInfo {
    private String sub;       // Google user ID
    private String email;
    private String name;
    private String picture;
    private boolean emailVerified;
}
