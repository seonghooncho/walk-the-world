package com.walkworld.api.domain.session.repository;

import com.walkworld.api.domain.session.entity.WalkSession;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalkSessionRepository extends JpaRepository<WalkSession, Long> {
  Optional<WalkSession> findByUserIdAndSessionDate(Long userId, LocalDate sessionDate);

  Optional<WalkSession> findByIdAndUserId(Long id, Long userId);

  Optional<WalkSession> findFirstByUserIdAndStatusOrderByStartedAtDesc(
      Long userId, WalkSession.SessionStatus status);
}
