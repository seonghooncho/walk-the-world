package com.walkworld.api.domain.currency.service;

import com.walkworld.api.domain.currency.dto.CurrencyResponse;
import com.walkworld.api.domain.currency.dto.CurrencyTransactionResponse;
import com.walkworld.api.global.response.ApiResponse;

import java.util.List;

public interface CurrencyService {
    CurrencyResponse getCurrency(Long userId);
    void deductCoupon(Long userId, int amount, String reason);
    void deductHearts(Long userId, int amount, String reason);
    ApiResponse<List<CurrencyTransactionResponse>> getTransactions(Long userId, String type, String cursor, int limit);
}
