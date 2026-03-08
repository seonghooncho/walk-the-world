package com.walkworld.api.domain.auth.dto.req;

import com.walkworld.api.global.validator.annotation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignupReqDTO {
    @NotBlank @Email
    private String email;

    @NotBlank @ValidPassword
    private String password;

    @NotBlank @Size(min = 1, max = 50)
    private String name;
}
