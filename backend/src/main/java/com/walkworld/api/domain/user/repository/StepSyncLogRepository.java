package com.walkworld.api.domain.user.repository;

import com.walkworld.api.domain.user.entity.StepSyncLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface StepSyncLogRepository extends JpaRepository<StepSyncLog, Long> {

    @Query("SELECT s FROM StepSyncLog s WHERE s.userId = :userId AND s.syncedAt BETWEEN :from AND :to ORDER BY s.syncedAt ASC")
    List<StepSyncLog> findByUserIdAndDateRange(Long userId, LocalDateTime from, LocalDateTime to);
}
