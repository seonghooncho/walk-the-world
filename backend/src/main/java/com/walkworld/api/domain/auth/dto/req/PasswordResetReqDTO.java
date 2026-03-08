package com.walkworld.api.domain.auth.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PasswordResetReqDTO {
    @NotBlank @Email
    private String email;
}
