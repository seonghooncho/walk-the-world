package com.walkworld.api.domain.mission.repository;

import com.walkworld.api.domain.mission.entity.UserMission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMissionRepository extends JpaRepository<UserMission, Long> {
    List<UserMission> findByUserId(Long userId);
    Optional<UserMission> findByUserIdAndMissionId(Long userId, String missionId);
    List<UserMission> findByUserIdAndStatus(Long userId, UserMission.MissionStatus status);
}
