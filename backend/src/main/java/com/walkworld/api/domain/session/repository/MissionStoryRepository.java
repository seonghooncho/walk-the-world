package com.walkworld.api.domain.session.repository;

import com.walkworld.api.domain.session.entity.MissionStory;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MissionStoryRepository extends JpaRepository<MissionStory, Long> {
  @Query("SELECT s FROM MissionStory s WHERE s.userId IN :userIds ORDER BY s.createdAt DESC, s.id DESC")
  List<MissionStory> findLatestByUserIds(List<Long> userIds, Pageable pageable);
}
