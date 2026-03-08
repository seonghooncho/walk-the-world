package com.walkworld.api.domain.badge.repository;

import com.walkworld.api.domain.badge.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    List<UserBadge> findByUserIdAndCityId(Long userId, String cityId);
    boolean existsByUserIdAndMissionId(Long userId, String missionId);
    long countByUserId(Long userId);
}
