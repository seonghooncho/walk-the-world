package com.walkworld.api.domain.auth.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginReqDTO {
    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;
}
