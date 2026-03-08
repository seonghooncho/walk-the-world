package com.walkworld.api.domain.badge.service;

import com.walkworld.api.domain.badge.dto.BadgeListResponse;
import com.walkworld.api.domain.badge.dto.BadgeResponse;
import com.walkworld.api.domain.badge.dto.BadgeStatsResponse;
import com.walkworld.api.domain.badge.entity.UserBadge;
import com.walkworld.api.domain.badge.repository.UserBadgeRepository;
import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.mission.entity.Mission;
import com.walkworld.api.domain.mission.repository.MissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BadgeServiceImpl implements BadgeService {

    private final UserBadgeRepository badgeRepository;
    private final MissionRepository missionRepository;
    private final CityRepository cityRepository;

    @Override
    public BadgeListResponse getBadges(Long userId, String cityId, Boolean earnedFilter) {
        List<Mission> missions = missionRepository.findAllByOrderByCityIdAscSortOrderAsc().stream()
                .filter(m -> m.getReward() != null && !m.getReward().isBlank())
                .toList();

        Map<String, UserBadge> earnedMap = badgeRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(UserBadge::getMissionId, b -> b));

        Map<String, City> cityMap = cityRepository.findAll().stream()
                .collect(Collectors.toMap(City::getId, c -> c));

        List<BadgeResponse> badges = new ArrayList<>();
        for (Mission m : missions) {
            if (cityId != null && !cityId.equals(m.getCityId())) continue;

            UserBadge ub = earnedMap.get(m.getId());
            boolean isEarned = ub != null;

            if (earnedFilter != null && earnedFilter != isEarned) continue;

            City city = cityMap.get(m.getCityId());
            badges.add(BadgeResponse.builder()
                    .id("badge_" + m.getId())
                    .missionId(m.getId())
                    .cityId(m.getCityId())
                    .cityName(city != null ? city.getName() : "")
                    .countryFlag(city != null ? city.getCountryFlag() : "")
                    .title(m.getReward())
                    .emoji(m.getEmoji())
                    .description(m.getTitle() + " 미션 완료")
                    .earned(isEarned)
                    .earnedAt(isEarned ? ub.getEarnedAt() : null)
                    .build());
        }

        int totalEarned = (int) badges.stream().filter(BadgeResponse::getEarned).count();

        return BadgeListResponse.builder()
                .totalEarned(totalEarned)
                .totalPossible(badges.size())
                .badges(badges)
                .build();
    }

    @Override
    public BadgeStatsResponse getStats(Long userId) {
        BadgeListResponse all = getBadges(userId, null, null);

        Map<String, BadgeStatsResponse.CityBadgeStats> cityStats = new LinkedHashMap<>();
        Map<String, List<BadgeResponse>> byCityId = all.getBadges().stream()
                .collect(Collectors.groupingBy(BadgeResponse::getCityId, LinkedHashMap::new, Collectors.toList()));

        for (var entry : byCityId.entrySet()) {
            int earned = (int) entry.getValue().stream().filter(BadgeResponse::getEarned).count();
            cityStats.put(entry.getKey(), BadgeStatsResponse.CityBadgeStats.builder()
                    .earned(earned).total(entry.getValue().size()).build());
        }

        return BadgeStatsResponse.builder()
                .totalEarned(all.getTotalEarned())
                .totalPossible(all.getTotalPossible())
                .cities(cityStats)
                .build();
    }

    @Override
    @Transactional
    public void awardBadge(Long userId, String missionId, String cityId, String title, String emoji) {
        if (badgeRepository.existsByUserIdAndMissionId(userId, missionId)) return;

        badgeRepository.save(UserBadge.builder()
                .userId(userId)
                .missionId(missionId)
                .cityId(cityId)
                .title(title)
                .emoji(emoji)
                .earnedAt(LocalDateTime.now())
                .build());
    }
}
