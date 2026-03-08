package com.walkworld.api.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class StepHistoryResponse {
    private List<DailyRecord> records;
    private Long totalSteps;
    private Long averageDaily;

    @Data
    @Builder
    @AllArgsConstructor
    public static class DailyRecord {
        private LocalDate date;
        private Long steps;
    }
}
