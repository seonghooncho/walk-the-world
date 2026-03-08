package com.walkworld.api.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 1, max = 50)
    private String name;
    private String avatarUrl;
}
