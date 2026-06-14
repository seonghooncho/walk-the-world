package com.walkworld.api.domain.session.repository;

import com.walkworld.api.domain.session.entity.WalkSessionMission;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalkSessionMissionRepository extends JpaRepository<WalkSessionMission, Long> {
  List<WalkSessionMission> findBySessionIdOrderBySortOrderAsc(Long sessionId);

  Optional<WalkSessionMission> findByIdAndSessionIdAndUserId(Long id, Long sessionId, Long userId);

  int countBySessionIdAndStatus(Long sessionId, WalkSessionMission.MissionStatus status);
}
