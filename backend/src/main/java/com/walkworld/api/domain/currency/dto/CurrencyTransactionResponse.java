package com.walkworld.api.domain.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class CurrencyTransactionResponse {
    private Long id;
    private String currencyType;
    private Integer amount;
    private String reason;
    private LocalDateTime createdAt;
}
