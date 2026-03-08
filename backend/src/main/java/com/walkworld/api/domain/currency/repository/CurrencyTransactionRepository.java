package com.walkworld.api.domain.currency.repository;

import com.walkworld.api.domain.currency.entity.CurrencyTransaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface CurrencyTransactionRepository extends JpaRepository<CurrencyTransaction, Long> {

    @Query("SELECT t FROM CurrencyTransaction t WHERE t.userId = :userId ORDER BY t.createdAt DESC, t.id DESC")
    List<CurrencyTransaction> findByUserIdLatest(Long userId, Pageable pageable);

    @Query("""
        SELECT t FROM CurrencyTransaction t WHERE t.userId = :userId
        AND (t.createdAt < :cursorCreatedAt OR (t.createdAt = :cursorCreatedAt AND t.id < :cursorId))
        ORDER BY t.createdAt DESC, t.id DESC
    """)
    List<CurrencyTransaction> findByUserIdCursor(Long userId, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);

    @Query("SELECT t FROM CurrencyTransaction t WHERE t.userId = :userId AND t.currencyType = :type ORDER BY t.createdAt DESC, t.id DESC")
    List<CurrencyTransaction> findByUserIdAndTypeLatest(Long userId, CurrencyTransaction.CurrencyType type, Pageable pageable);

    @Query("""
        SELECT t FROM CurrencyTransaction t WHERE t.userId = :userId AND t.currencyType = :type
        AND (t.createdAt < :cursorCreatedAt OR (t.createdAt = :cursorCreatedAt AND t.id < :cursorId))
        ORDER BY t.createdAt DESC, t.id DESC
    """)
    List<CurrencyTransaction> findByUserIdAndTypeCursor(Long userId, CurrencyTransaction.CurrencyType type, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);
}
