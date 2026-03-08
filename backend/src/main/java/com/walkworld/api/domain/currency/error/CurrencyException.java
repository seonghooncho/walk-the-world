package com.walkworld.api.domain.currency.error;

import com.walkworld.api.global.error.CustomException;

public class CurrencyException extends CustomException {
    public CurrencyException(CurrencyErrorCode errorCode) {
        super(errorCode);
    }
}
