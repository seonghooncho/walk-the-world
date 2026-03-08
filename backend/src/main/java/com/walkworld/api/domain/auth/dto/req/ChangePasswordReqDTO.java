package com.walkworld.api.domain.auth.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordReqDTO {
    @NotBlank
    private String currentPassword;

    @NotBlank
    private String newPassword;
}
