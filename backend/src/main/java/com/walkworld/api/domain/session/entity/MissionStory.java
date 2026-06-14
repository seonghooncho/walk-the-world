package com.walkworld.api.domain.session.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "mission_stories")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class MissionStory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "session_id", nullable = false)
  private Long sessionId;

  @Column(name = "session_mission_id", nullable = false)
  private Long sessionMissionId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "city_id", nullable = false, length = 50)
  private String cityId;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String content;

  @Column(name = "image_key", length = 500)
  private String imageKey;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private Visibility visibility = Visibility.friends;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  public enum Visibility {
    friends
  }
}
