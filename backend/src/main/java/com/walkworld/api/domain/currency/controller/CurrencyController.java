package com.walkworld.api.domain.currency.controller;

import com.walkworld.api.domain.currency.dto.CurrencyResponse;
import com.walkworld.api.domain.currency.dto.CurrencyTransactionResponse;
import com.walkworld.api.domain.currency.service.CurrencyService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/currency/v1")
@RequiredArgsConstructor
public class CurrencyController {

  private final CurrencyService currencyService;

  @GetMapping
  public ApiResponse<CurrencyResponse> getCurrency(@CurrentUserId Long userId) {
    return ApiResponse.ok(currencyService.getCurrency(userId));
  }

  @PostMapping("/exchange/friend-coupon")
  public ApiResponse<CurrencyResponse> exchangeFriendCoupon(@CurrentUserId Long userId) {
    return ApiResponse.ok(currencyService.exchangeFriendCoupon(userId));
  }

  @GetMapping("/transactions")
  public ApiResponse<List<CurrencyTransactionResponse>> getTransactions(
      @CurrentUserId Long userId,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int limit) {
    return currencyService.getTransactions(userId, type, cursor, Math.max(1, Math.min(limit, 100)));
  }
}
