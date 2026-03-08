package com.walkworld.api.domain.badge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_badges")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "mission_id", nullable = false, length = 50)
    private String missionId;

    @Column(name = "city_id", nullable = false, length = 50)
    private String cityId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 10)
    private String emoji;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;
}
