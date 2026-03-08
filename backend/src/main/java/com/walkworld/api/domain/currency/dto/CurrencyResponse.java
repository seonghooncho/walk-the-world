package com.walkworld.api.domain.currency.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class CurrencyResponse {
    private Integer coupons;
    private Integer hearts;
}
