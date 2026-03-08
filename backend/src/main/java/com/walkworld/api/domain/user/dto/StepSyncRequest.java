package com.walkworld.api.domain.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StepSyncRequest {
    @NotNull @Min(0)
    private Long steps;
}
