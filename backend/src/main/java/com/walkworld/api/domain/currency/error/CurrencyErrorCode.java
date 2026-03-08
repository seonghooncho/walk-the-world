package com.walkworld.api.domain.currency.error;

import com.walkworld.api.global.error.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CurrencyErrorCode implements BaseErrorCode {

    CURRENCY_NOT_FOUND(HttpStatus.NOT_FOUND, "CURRENCY_NOT_FOUND", "재화 정보를 찾을 수 없습니다"),
    INSUFFICIENT_COUPONS(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE", "친추 쿠폰이 부족합니다"),
    INSUFFICIENT_HEARTS(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE", "하트가 부족합니다");

    private final HttpStatus httpStatus;
    private final String code;
    private final String message;
}
