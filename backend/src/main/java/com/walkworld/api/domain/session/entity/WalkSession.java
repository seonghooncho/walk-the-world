package com.walkworld.api.domain.session.entity;

import com.walkworld.api.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "walk_sessions",
    uniqueConstraints = @UniqueConstraint(name = "uk_walk_sessions_user_date", columnNames = {"user_id", "session_date"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalkSession extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "session_date", nullable = false)
  private LocalDate sessionDate;

  @Enumerated(EnumType.STRING)
  @Column(name = "activity_type", nullable = false)
  private ActivityType activityType;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private SessionStatus status = SessionStatus.active;

  @Column(name = "city_id", nullable = false, length = 50)
  private String cityId;

  @Column(name = "goal_meters", nullable = false)
  @Builder.Default
  private Integer goalMeters = 1000;

  @Column(name = "distance_meters", nullable = false)
  @Builder.Default
  private Integer distanceMeters = 0;

  @Column(name = "bonus_meters", nullable = false)
  @Builder.Default
  private Integer bonusMeters = 0;

  @Column(name = "duration_seconds", nullable = false)
  @Builder.Default
  private Integer durationSeconds = 0;

  @Column(name = "tickets_earned", nullable = false)
  @Builder.Default
  private Integer ticketsEarned = 0;

  @Column(name = "stamps_earned", nullable = false)
  @Builder.Default
  private Integer stampsEarned = 0;

  @Column(name = "environment_hint", length = 100)
  private String environmentHint;

  @Column(name = "playlist_title", length = 100)
  private String playlistTitle;

  @Column(name = "playlist_url", length = 500)
  private String playlistUrl;

  @Column(name = "started_at", nullable = false)
  private LocalDateTime startedAt;

  @Column(name = "ended_at")
  private LocalDateTime endedAt;

  public enum ActivityType {
    walk,
    run
  }

  public enum SessionStatus {
    active,
    completed,
    abandoned
  }
}
