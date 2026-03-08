package com.walkworld.api.domain.currency.repository;

import com.walkworld.api.domain.currency.entity.UserCurrency;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCurrencyRepository extends JpaRepository<UserCurrency, Long> {
}
