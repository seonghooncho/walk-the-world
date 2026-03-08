package com.walkworld.api.domain.mission.service;

import com.walkworld.api.domain.badge.service.BadgeService;
import com.walkworld.api.domain.mission.converter.MissionConverter;
import com.walkworld.api.domain.mission.dto.*;
import com.walkworld.api.domain.mission.entity.Mission;
import com.walkworld.api.domain.mission.entity.UserMission;
import com.walkworld.api.domain.mission.error.MissionErrorCode;
import com.walkworld.api.domain.mission.error.MissionException;
import com.walkworld.api.domain.mission.repository.MissionRepository;
import com.walkworld.api.domain.mission.repository.UserMissionRepository;
import com.walkworld.api.domain.post.entity.Post;
import com.walkworld.api.domain.post.repository.PostRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MissionServiceImpl implements MissionService {

    private final MissionRepository missionRepository;
    private final UserMissionRepository userMissionRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final BadgeService badgeService;
    private final S3Service s3Service;

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<MissionResponse>> getMissions(Long userId, String cityId, String statusFilter) {
        List<Mission> missions = cityId != null
                ? missionRepository.findByCityIdOrderBySortOrderAsc(cityId)
                : missionRepository.findAllByOrderByCityIdAscSortOrderAsc();

        Map<String, UserMission> userMissionMap = userMissionRepository.findByUserId(userId)
                .stream().collect(Collectors.toMap(UserMission::getMissionId, um -> um));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        Map<String, List<MissionResponse>> result = new LinkedHashMap<>();

        for (Mission mission : missions) {
            UserMission um = userMissionMap.get(mission.getId());
            String status = resolveStatus(mission, um, user.getTotalSteps());

            if (statusFilter != null && !statusFilter.equals(status)) continue;

            MissionResponse response = MissionConverter.toMissionResponse(mission, um, status);
            result.computeIfAbsent(mission.getCityId(), k -> new ArrayList<>()).add(response);
        }

        return result;
    }

    @Override
    public MissionCompleteResponse completeMission(Long userId, String missionId,
                                                      String imageKey, String text, boolean autoPost) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new MissionException(MissionErrorCode.MISSION_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        UserMission um = userMissionRepository.findByUserIdAndMissionId(userId, missionId)
                .orElse(UserMission.builder().userId(userId).missionId(missionId).build());

        if (um.getStatus() == UserMission.MissionStatus.completed) {
            throw new MissionException(MissionErrorCode.ALREADY_COMPLETED);
        }

        String currentStatus = resolveStatus(mission, um, user.getTotalSteps());
        if ("locked".equals(currentStatus)) {
            throw new MissionException(MissionErrorCode.MISSION_LOCKED);
        }

        um.setStatus(UserMission.MissionStatus.completed);
        um.setCompletedAt(LocalDateTime.now());
        userMissionRepository.save(um);

        if (mission.getReward() != null && !mission.getReward().isBlank()) {
            badgeService.awardBadge(userId, missionId, mission.getCityId(), mission.getReward(), mission.getEmoji());
        }

        Long autoPostedId = null;
        if (autoPost) {
            String content = text != null && !text.isBlank()
                    ? text
                    : mission.getEmoji() + " \"" + mission.getTitle() + "\" 미션을 완료했어요!";

            Post post = Post.builder()
                    .userId(userId)
                    .cityId(mission.getCityId())
                    .content(content)
                    .build();

            if (imageKey != null && !imageKey.isBlank()) {
                post.setImageKey(imageKey);
            }

            postRepository.save(post);
            autoPostedId = post.getId();
        }

        return MissionCompleteResponse.builder()
                .missionId(missionId)
                .status("completed")
                .completedAt(um.getCompletedAt())
                .reward(mission.getReward())
                .autoPostedId(autoPostedId)
                .build();
    }

    @Override
    public CompositeResponse compositeImage(Long userId, String missionId, String imageKey) {
        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new MissionException(MissionErrorCode.MISSION_NOT_FOUND));

        if (!mission.getAiComposite()) {
            throw new MissionException(MissionErrorCode.NOT_AI_MISSION);
        }

        String compositeKey = "composite/" + missionId + "_" + userId + ".jpg";

        UserMission um = userMissionRepository.findByUserIdAndMissionId(userId, missionId)
                .orElse(UserMission.builder().userId(userId).missionId(missionId).build());
        um.setCompositeImageUrl(compositeKey);
        userMissionRepository.save(um);

        return CompositeResponse.builder()
                .missionId(missionId)
                .compositeImage(CompositeResponse.CompositeImage.builder()
                        .url(s3Service.generateDownloadUrl(compositeKey))
                        .thumbnailUrl(s3Service.generateDownloadUrl(compositeKey))
                        .width(1024)
                        .height(1024)
                        .prompt(mission.getAiPrompt())
                        .build())
                .expiresAt(LocalDateTime.now().plusHours(1))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public MissionStatsResponse getStats(Long userId) {
        List<Mission> allMissions = missionRepository.findAllByOrderByCityIdAscSortOrderAsc();
        Map<String, UserMission> userMissionMap = userMissionRepository.findByUserId(userId)
                .stream().collect(Collectors.toMap(UserMission::getMissionId, um -> um));

        Map<String, MissionStatsResponse.CityStats> cityStats = new LinkedHashMap<>();
        int totalCompleted = 0;

        Map<String, List<Mission>> byCityId = allMissions.stream()
                .collect(Collectors.groupingBy(Mission::getCityId, LinkedHashMap::new, Collectors.toList()));

        for (var entry : byCityId.entrySet()) {
            int completed = 0;
            for (Mission m : entry.getValue()) {
                UserMission um = userMissionMap.get(m.getId());
                if (um != null && um.getStatus() == UserMission.MissionStatus.completed) {
                    completed++;
                }
            }
            cityStats.put(entry.getKey(), MissionStatsResponse.CityStats.builder()
                    .completed(completed)
                    .total(entry.getValue().size())
                    .build());
            totalCompleted += completed;
        }

        return MissionStatsResponse.builder()
                .totalCompleted(totalCompleted)
                .totalMissions(allMissions.size())
                .cities(cityStats)
                .build();
    }

    private String resolveStatus(Mission mission, UserMission um, Long userSteps) {
        if (um != null && um.getStatus() == UserMission.MissionStatus.completed) return "completed";
        if (userSteps >= mission.getStepsRequired()) return "available";
        return "locked";
    }
}
