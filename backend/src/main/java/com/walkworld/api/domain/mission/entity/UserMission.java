package com.walkworld.api.domain.mission.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_missions")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserMission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mission_id", nullable = false, length = 50)
    private String missionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MissionStatus status = MissionStatus.locked;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "composite_image_url", length = 500)
    private String compositeImageUrl;

    public enum MissionStatus {
        locked, available, completed
    }
}
