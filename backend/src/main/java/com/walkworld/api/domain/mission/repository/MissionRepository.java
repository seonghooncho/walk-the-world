package com.walkworld.api.domain.mission.repository;

import com.walkworld.api.domain.mission.entity.Mission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, String> {
    List<Mission> findByCityIdOrderBySortOrderAsc(String cityId);
    List<Mission> findAllByOrderByCityIdAscSortOrderAsc();
}
