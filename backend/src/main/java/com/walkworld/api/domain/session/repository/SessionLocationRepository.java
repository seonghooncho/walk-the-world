package com.walkworld.api.domain.session.repository;

import com.walkworld.api.domain.session.entity.SessionLocation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionLocationRepository extends JpaRepository<SessionLocation, Long> {
  Optional<SessionLocation> findFirstBySessionIdOrderByRecordedAtDescIdDesc(Long sessionId);

  List<SessionLocation> findTop80BySessionIdOrderByRecordedAtAscIdAsc(Long sessionId);
}
