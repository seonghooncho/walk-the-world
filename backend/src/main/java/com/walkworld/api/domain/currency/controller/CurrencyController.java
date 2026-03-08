package com.walkworld.api.domain.currency.controller;

import com.walkworld.api.domain.currency.dto.CurrencyTransactionResponse;
import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.currency.dto.CurrencyResponse;
import com.walkworld.api.domain.currency.service.CurrencyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/currency/v1")
@RequiredArgsConstructor
public class CurrencyController {

    private final CurrencyService currencyService;

    @GetMapping
    public ApiResponse<CurrencyResponse> getCurrency(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(currencyService.getCurrency(userId));
    }

    @GetMapping("/transactions")
    public ApiResponse<List<CurrencyTransactionResponse>> getTransactions(
            Authentication auth,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        Long userId = (Long) auth.getPrincipal();
        return currencyService.getTransactions(userId, type, cursor, Math.min(limit, 100));
    }
}
