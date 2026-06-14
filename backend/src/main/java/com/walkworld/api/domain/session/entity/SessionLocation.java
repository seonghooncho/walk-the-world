package com.walkworld.api.domain.session.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "walk_session_locations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SessionLocation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "session_id", nullable = false)
  private Long sessionId;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(nullable = false, precision = 10, scale = 6)
  private BigDecimal latitude;

  @Column(nullable = false, precision = 10, scale = 6)
  private BigDecimal longitude;

  @Column(name = "accuracy_meters", precision = 8, scale = 2)
  private BigDecimal accuracyMeters;

  @Column(name = "distance_from_previous_meters", nullable = false)
  @Builder.Default
  private Integer distanceFromPreviousMeters = 0;

  @Column(name = "recorded_at", nullable = false)
  private LocalDateTime recordedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;
}
