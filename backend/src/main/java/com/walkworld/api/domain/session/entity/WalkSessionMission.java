package com.walkworld.api.domain.session.entity;

import com.walkworld.api.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;

@Entity
@Table(
    name = "walk_session_missions",
    uniqueConstraints = @UniqueConstraint(name = "uk_wsm_session_key", columnNames = {"session_id", "mission_key"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalkSessionMission extends BaseTimeEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "session_id", nullable = false)
  private Long sessionId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "mission_key", nullable = false, length = 80)
  private String missionKey;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "proof_type", nullable = false)
  private ProofType proofType;

  @Column(length = 10)
  private String emoji;

  @Column(name = "bonus_meters", nullable = false)
  @Builder.Default
  private Integer bonusMeters = 100;

  @Column(name = "stamp_reward", length = 100)
  private String stampReward;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private MissionStatus status = MissionStatus.available;

  @Enumerated(EnumType.STRING)
  @Column(name = "verification_status", nullable = false)
  @Builder.Default
  private VerificationStatus verificationStatus = VerificationStatus.pending;

  @Column(name = "image_key", length = 500)
  private String imageKey;

  @Column(name = "text_proof", columnDefinition = "TEXT")
  private String textProof;

  @Column(name = "completed_at")
  private LocalDateTime completedAt;

  @Column(name = "sort_order", nullable = false)
  @Builder.Default
  private Integer sortOrder = 0;

  public enum ProofType {
    photo,
    text,
    session,
    screenshot,
    social
  }

  public enum MissionStatus {
    available,
    completed
  }

  public enum VerificationStatus {
    pending,
    verified,
    rejected,
    fallback_accepted
  }
}
