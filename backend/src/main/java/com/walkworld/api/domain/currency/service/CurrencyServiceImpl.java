package com.walkworld.api.domain.currency.service;

import com.walkworld.api.domain.currency.dto.CurrencyResponse;
import com.walkworld.api.domain.currency.dto.CurrencyTransactionResponse;
import com.walkworld.api.domain.currency.entity.CurrencyTransaction;
import com.walkworld.api.domain.currency.entity.UserCurrency;
import com.walkworld.api.domain.currency.error.CurrencyErrorCode;
import com.walkworld.api.domain.currency.error.CurrencyException;
import com.walkworld.api.domain.currency.repository.CurrencyTransactionRepository;
import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.global.pagination.Cursor;
import com.walkworld.api.global.pagination.CursorCodec;
import com.walkworld.api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CurrencyServiceImpl implements CurrencyService {

    private final UserCurrencyRepository currencyRepository;
    private final CurrencyTransactionRepository transactionRepository;
    private final CursorCodec cursorCodec;

    @Override
    @Transactional(readOnly = true)
    public CurrencyResponse getCurrency(Long userId) {
        UserCurrency currency = currencyRepository.findById(userId)
                .orElse(UserCurrency.builder().userId(userId).coupons(0).hearts(0).build());
        return CurrencyResponse.builder()
                .coupons(currency.getCoupons())
                .hearts(currency.getHearts())
                .build();
    }

    @Override
    public void deductCoupon(Long userId, int amount, String reason) {
        UserCurrency c = currencyRepository.findById(userId)
                .orElseThrow(() -> new CurrencyException(CurrencyErrorCode.CURRENCY_NOT_FOUND));
        if (c.getCoupons() < amount) {
            throw new CurrencyException(CurrencyErrorCode.INSUFFICIENT_COUPONS);
        }
        c.setCoupons(c.getCoupons() - amount);
        currencyRepository.save(c);

        transactionRepository.save(CurrencyTransaction.builder()
                .userId(userId)
                .currencyType(CurrencyTransaction.CurrencyType.coupon)
                .amount(-amount)
                .reason(reason)
                .build());
    }

    @Override
    public void deductHearts(Long userId, int amount, String reason) {
        UserCurrency c = currencyRepository.findById(userId)
                .orElseThrow(() -> new CurrencyException(CurrencyErrorCode.CURRENCY_NOT_FOUND));
        if (c.getHearts() < amount) {
            throw new CurrencyException(CurrencyErrorCode.INSUFFICIENT_HEARTS);
        }
        c.setHearts(c.getHearts() - amount);
        currencyRepository.save(c);

        transactionRepository.save(CurrencyTransaction.builder()
                .userId(userId)
                .currencyType(CurrencyTransaction.CurrencyType.heart)
                .amount(-amount)
                .reason(reason)
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CurrencyTransactionResponse>> getTransactions(Long userId, String type, String cursorToken, int limit) {
        PageRequest pageable = PageRequest.of(0, limit + 1);
        List<CurrencyTransaction> txns;

        if (cursorToken != null && !cursorToken.isBlank()) {
            Cursor c = cursorCodec.decode(cursorToken);
            if (type != null && !type.isBlank()) {
                CurrencyTransaction.CurrencyType ct = CurrencyTransaction.CurrencyType.valueOf(type);
                txns = transactionRepository.findByUserIdAndTypeCursor(userId, ct, c.createdAt(), c.id(), pageable);
            } else {
                txns = transactionRepository.findByUserIdCursor(userId, c.createdAt(), c.id(), pageable);
            }
        } else {
            if (type != null && !type.isBlank()) {
                CurrencyTransaction.CurrencyType ct = CurrencyTransaction.CurrencyType.valueOf(type);
                txns = transactionRepository.findByUserIdAndTypeLatest(userId, ct, pageable);
            } else {
                txns = transactionRepository.findByUserIdLatest(userId, pageable);
            }
        }

        boolean hasNext = txns.size() > limit;
        if (hasNext) txns = txns.subList(0, limit);

        List<CurrencyTransactionResponse> responses = txns.stream()
                .map(t -> CurrencyTransactionResponse.builder()
                        .id(t.getId())
                        .currencyType(t.getCurrencyType().name())
                        .amount(t.getAmount())
                        .reason(t.getReason())
                        .createdAt(t.getCreatedAt())
                        .build())
                .toList();

        String nextCursor = null;
        if (hasNext && !txns.isEmpty()) {
            CurrencyTransaction last = txns.get(txns.size() - 1);
            nextCursor = cursorCodec.encode(new Cursor(last.getId(), last.getCreatedAt()));
        }

        return ApiResponse.ok(responses, ApiResponse.PageMeta.builder()
                .limit(limit).hasNext(hasNext).nextCursor(nextCursor).build());
    }
}
