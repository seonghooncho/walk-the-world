package com.walkworld.api.domain.mission.converter;

import com.walkworld.api.domain.mission.dto.MissionResponse;
import com.walkworld.api.domain.mission.entity.Mission;
import com.walkworld.api.domain.mission.entity.UserMission;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class MissionConverter {

    public static MissionResponse toMissionResponse(Mission mission, UserMission um, String status) {
        return MissionResponse.builder()
                .id(mission.getId())
                .cityId(mission.getCityId())
                .type(mission.getType().name())
                .title(mission.getTitle())
                .description(mission.getDescription())
                .imageUrl(mission.getImageUrl())
                .stepsRequired(mission.getStepsRequired())
                .emoji(mission.getEmoji())
                .reward(mission.getReward())
                .status(status)
                .completedAt(um != null ? um.getCompletedAt() : null)
                .aiComposite(mission.getAiComposite())
                .aiPrompt(mission.getAiPrompt())
                .build();
    }
}
