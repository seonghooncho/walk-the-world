package com.walkworld.api.domain.user.entity;

import com.walkworld.api.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "total_steps", nullable = false)
    @Builder.Default
    private Long totalSteps = 0L;

    @Column(name = "current_city_id", length = 50)
    private String currentCityId;

    @Column(name = "kakao_id")
    private Long kakaoId;

    @Column(name = "google_id")
    private String googleId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.active;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    public boolean isActive() {
        return status == null || status == UserStatus.active;
    }

    public boolean isWithdrawn() {
        return status == UserStatus.withdrawn;
    }
}
