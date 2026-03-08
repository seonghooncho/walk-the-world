package com.walkworld.api.domain.mission.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "missions")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @Column(length = 50)
    private String id;

    @Column(name = "city_id", nullable = false, length = 50)
    private String cityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MissionType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "steps_required", nullable = false)
    @Builder.Default
    private Long stepsRequired = 0L;

    @Column(length = 10)
    private String emoji;

    @Column(length = 200)
    private String reward;

    @Column(name = "ai_composite", nullable = false)
    @Builder.Default
    private Boolean aiComposite = false;

    @Column(name = "ai_prompt", columnDefinition = "TEXT")
    private String aiPrompt;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    public enum MissionType {
        photo, food, writing, explore, social
    }
}
