package com.walkworld.api.domain.auth.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginReqDTO {
    @NotBlank
    private String idToken;
}
