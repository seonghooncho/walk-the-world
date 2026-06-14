package com.walkworld.api.domain.session.service;

import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.currency.service.CurrencyService;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.session.dto.*;
import com.walkworld.api.domain.session.entity.MissionStory;
import com.walkworld.api.domain.session.entity.SessionLocation;
import com.walkworld.api.domain.session.entity.WalkSession;
import com.walkworld.api.domain.session.entity.WalkSessionMission;
import com.walkworld.api.domain.session.error.SessionErrorCode;
import com.walkworld.api.domain.session.error.SessionException;
import com.walkworld.api.domain.session.repository.MissionStoryRepository;
import com.walkworld.api.domain.session.repository.SessionLocationRepository;
import com.walkworld.api.domain.session.repository.WalkSessionMissionRepository;
import com.walkworld.api.domain.session.repository.WalkSessionRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.response.ApiResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class WalkSessionService {

  private static final ZoneId SERVICE_ZONE = ZoneId.of("Asia/Seoul");
  private static final int DAILY_GOAL_METERS = 1000;
  private static final int MAX_GPS_ACCURACY_METERS = 100;
  private static final int MAX_SEGMENT_METERS = 300;
  private static final String PLAYLIST_TITLE = "오늘의 산책 플레이리스트";
  private static final String PLAYLIST_URL = "https://www.youtube.com/results?search_query=walking+playlist";

  private final WalkSessionRepository sessionRepository;
  private final SessionLocationRepository locationRepository;
  private final WalkSessionMissionRepository missionRepository;
  private final MissionStoryRepository storyRepository;
  private final UserRepository userRepository;
  private final CityRepository cityRepository;
  private final FriendshipRepository friendshipRepository;
  private final CurrencyService currencyService;
  private final S3Service s3Service;

  @Transactional(readOnly = true)
  public TodaySessionResponse getToday(Long userId) {
    LocalDate today = LocalDate.now(SERVICE_ZONE);
    return sessionRepository
        .findByUserIdAndSessionDate(userId, today)
        .map(this::toTodayResponse)
        .orElseGet(() -> emptyTodayResponse(userId, today));
  }

  public TodaySessionResponse startSession(Long userId, StartSessionRequest request) {
    LocalDate today = LocalDate.now(SERVICE_ZONE);
    var existing = sessionRepository.findByUserIdAndSessionDate(userId, today);
    if (existing.isPresent()) {
      return toTodayResponse(existing.get());
    }

    User user = findUser(userId);
    City city = resolveCity(user.getCurrentCityId());
    WalkSession.ActivityType activityType = parseActivityType(request.activityType());
    LocalDateTime now = LocalDateTime.now(SERVICE_ZONE);

    WalkSession session =
        WalkSession.builder()
            .userId(userId)
            .sessionDate(today)
            .activityType(activityType)
            .status(WalkSession.SessionStatus.active)
            .cityId(city.getId())
            .goalMeters(DAILY_GOAL_METERS)
            .distanceMeters(0)
            .bonusMeters(0)
            .durationSeconds(0)
            .ticketsEarned(0)
            .stampsEarned(0)
            .environmentHint(normalizeEnvironmentHint(request.environmentHint()))
            .playlistTitle(PLAYLIST_TITLE)
            .playlistUrl(PLAYLIST_URL)
            .startedAt(now)
            .build();
    sessionRepository.save(session);

    createDailyMissions(session);

    if (request.startLocation() != null) {
      recordLocationInternal(userId, session, request.startLocation());
    }

    return toTodayResponse(session);
  }

  public LocationPointResponse recordLocation(
      Long userId, Long sessionId, LocationPointRequest request) {
    WalkSession session = findSession(userId, sessionId);
    if (session.getStatus() != WalkSession.SessionStatus.active) {
      throw new SessionException(SessionErrorCode.SESSION_ALREADY_FINISHED);
    }

    int added = recordLocationInternal(userId, session, request);
    session.setDurationSeconds(secondsBetween(session.getStartedAt(), LocalDateTime.now(SERVICE_ZONE)));
    sessionRepository.save(session);

    return new LocationPointResponse(
        session.getId(),
        session.getDistanceMeters(),
        session.getBonusMeters(),
        progressMeters(session),
        progressPercent(session),
        added);
  }

  public MissionProofResponse submitMissionProof(
      Long userId, Long sessionId, Long missionId, MissionProofRequest request) {
    WalkSession session = findSession(userId, sessionId);
    WalkSessionMission mission =
        missionRepository
            .findByIdAndSessionIdAndUserId(missionId, sessionId, userId)
            .orElseThrow(() -> new SessionException(SessionErrorCode.MISSION_NOT_FOUND));

    if (mission.getStatus() == WalkSessionMission.MissionStatus.completed) {
      throw new SessionException(SessionErrorCode.MISSION_ALREADY_COMPLETED);
    }

    validateProof(mission, request);
    LocalDateTime now = LocalDateTime.now(SERVICE_ZONE);
    WalkSessionMission.VerificationStatus verificationStatus = resolveVerificationStatus(mission, request);

    mission.setStatus(WalkSessionMission.MissionStatus.completed);
    mission.setVerificationStatus(verificationStatus);
    mission.setImageKey(blankToNull(request.imageKey()));
    mission.setTextProof(blankToNull(request.text()));
    mission.setCompletedAt(now);
    missionRepository.save(mission);

    session.setBonusMeters(session.getBonusMeters() + mission.getBonusMeters());
    session.setStampsEarned(
        missionRepository.countBySessionIdAndStatus(
            sessionId, WalkSessionMission.MissionStatus.completed));
    session.setDurationSeconds(secondsBetween(session.getStartedAt(), now));
    sessionRepository.save(session);

    Long storyId = createStoryIfShareable(session, mission);

    return new MissionProofResponse(
        mission.getId(),
        mission.getStatus().name(),
        mission.getVerificationStatus().name(),
        mission.getBonusMeters(),
        progressMeters(session),
        progressPercent(session),
        storyId);
  }

  public FinishSessionResponse finishSession(Long userId, Long sessionId) {
    WalkSession session = findSession(userId, sessionId);

    if (session.getStatus() == WalkSession.SessionStatus.active) {
      LocalDateTime now = LocalDateTime.now(SERVICE_ZONE);
      session.setDurationSeconds(secondsBetween(session.getStartedAt(), now));
      session.setStampsEarned(
          missionRepository.countBySessionIdAndStatus(
              sessionId, WalkSessionMission.MissionStatus.completed));
      session.setTicketsEarned(calculateTickets(session));
      session.setStatus(
          progressMeters(session) >= session.getGoalMeters()
              ? WalkSession.SessionStatus.completed
              : WalkSession.SessionStatus.abandoned);
      session.setEndedAt(now);
      sessionRepository.save(session);

      currencyService.awardTickets(
          userId, session.getTicketsEarned(), "오늘의 산책 세션 보상");
    }

    return new FinishSessionResponse(
        session.getId(),
        session.getStatus().name(),
        session.getDistanceMeters(),
        session.getBonusMeters(),
        progressMeters(session),
        progressPercent(session),
        session.getDurationSeconds(),
        session.getTicketsEarned(),
        session.getStampsEarned(),
        currencyService.getCurrency(userId).getTickets() >= 3);
  }

  @Transactional(readOnly = true)
  public ApiResponse<List<StoryResponse>> getFriendStories(Long userId, int limit) {
    List<Long> userIds = new ArrayList<>(friendshipRepository.findFriendIdsByUserId(userId));
    userIds.add(userId);
    List<MissionStory> stories =
        storyRepository.findLatestByUserIds(userIds, PageRequest.of(0, Math.max(1, Math.min(limit, 50))));

    List<StoryResponse> responses =
        stories.stream().map(this::toStoryResponse).toList();
    return ApiResponse.ok(responses);
  }

  private TodaySessionResponse emptyTodayResponse(Long userId, LocalDate today) {
    User user = findUser(userId);
    City city = resolveCity(user.getCurrentCityId());
    List<SessionMissionResponse> previewMissions =
        missionTemplates("city", today).stream()
            .limit(5)
            .map(
                template ->
                    new SessionMissionResponse(
                        null,
                        template.key(),
                        template.title(),
                        template.description(),
                        template.proofType().name(),
                        template.emoji(),
                        template.bonusMeters(),
                        template.stampReward(),
                        "available",
                        "pending",
                        null,
                        null))
            .toList();

    return new TodaySessionResponse(
        null,
        today,
        "ready",
        "walk",
        city.getId(),
        city.getName(),
        city.getCountryFlag(),
        DAILY_GOAL_METERS,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        "city",
        PLAYLIST_TITLE,
        PLAYLIST_URL,
        null,
        null,
        previewMissions);
  }

  private int recordLocationInternal(Long userId, WalkSession session, GeoPointRequest request) {
    validateLocation(request.latitude(), request.longitude());
    return recordLocationInternal(
        userId,
        session,
        request.latitude(),
        request.longitude(),
        request.accuracyMeters(),
        request.recordedAt());
  }

  private int recordLocationInternal(Long userId, WalkSession session, LocationPointRequest request) {
    validateLocation(request.latitude(), request.longitude());
    return recordLocationInternal(
        userId,
        session,
        request.latitude(),
        request.longitude(),
        request.accuracyMeters(),
        request.recordedAt());
  }

  private int recordLocationInternal(
      Long userId,
      WalkSession session,
      Double latitude,
      Double longitude,
      Double accuracyMeters,
      OffsetDateTime recordedAt) {
    int distanceAdded = 0;
    boolean currentUsable = isUsableAccuracy(accuracyMeters);
    var previous = locationRepository.findFirstBySessionIdOrderByRecordedAtDescIdDesc(session.getId());

    if (currentUsable && previous.isPresent() && isUsableAccuracy(previous.get().getAccuracyMeters())) {
      int segment = haversineMeters(previous.get(), latitude, longitude);
      if (segment <= MAX_SEGMENT_METERS) {
        distanceAdded = segment;
      }
    }

    SessionLocation location =
        SessionLocation.builder()
            .sessionId(session.getId())
            .userId(userId)
            .latitude(BigDecimal.valueOf(latitude))
            .longitude(BigDecimal.valueOf(longitude))
            .accuracyMeters(accuracyMeters != null ? BigDecimal.valueOf(accuracyMeters) : null)
            .distanceFromPreviousMeters(distanceAdded)
            .recordedAt(toLocalDateTime(recordedAt))
            .build();
    locationRepository.save(location);

    if (distanceAdded > 0) {
      session.setDistanceMeters(session.getDistanceMeters() + distanceAdded);
      sessionRepository.save(session);
    }

    return distanceAdded;
  }

  private void createDailyMissions(WalkSession session) {
    List<MissionTemplate> templates = missionTemplates(session.getEnvironmentHint(), session.getSessionDate());
    for (int i = 0; i < Math.min(5, templates.size()); i++) {
      MissionTemplate template = templates.get(i);
      missionRepository.save(
          WalkSessionMission.builder()
              .sessionId(session.getId())
              .userId(session.getUserId())
              .missionKey(template.key())
              .title(template.title())
              .description(template.description())
              .proofType(template.proofType())
              .emoji(template.emoji())
              .bonusMeters(template.bonusMeters())
              .stampReward(template.stampReward())
              .sortOrder(i + 1)
              .build());
    }
  }

  private List<MissionTemplate> missionTemplates(String environmentHint, LocalDate date) {
    String hint = environmentHint != null ? environmentHint.toLowerCase() : "";
    List<MissionTemplate> candidates = new ArrayList<>();
    candidates.add(new MissionTemplate("open_sky", "뻥 뚫린 오늘 하늘 찍기", "산책 중 고개를 들었을 때 보이는 하늘을 사진으로 남겨보세요.", WalkSessionMission.ProofType.photo, "☁️", 120, "하늘 산책 스탬프"));
    candidates.add(new MissionTemplate("crosswalk", "횡단보도 한 컷", "안전하게 멈춘 순간, 횡단보도나 보행자 표식을 찍어보세요.", WalkSessionMission.ProofType.photo, "🚶", 100, "도시 보행 스탬프"));
    candidates.add(new MissionTemplate("red_sign", "빨간 간판 찾기", "눈에 들어오는 빨간 간판이나 표지판을 찾아 사진으로 인증해보세요.", WalkSessionMission.ProofType.photo, "🟥", 100, "빨간 발견 스탬프"));
    candidates.add(new MissionTemplate("snack_find", "산책 간식 발견", "편의점이나 가게에서 기분 좋은 간식 하나를 찾아 기록해보세요.", WalkSessionMission.ProofType.photo, "🍿", 120, "간식 탐험 스탬프"));
    candidates.add(new MissionTemplate("walk_15", "15분 산책 유지", "오늘의 세션을 15분 이상 이어가면 완료할 수 있어요.", WalkSessionMission.ProofType.session, "⏱️", 160, "꾸준함 스탬프"));
    candidates.add(new MissionTemplate("walk_note", "산책 기분 한 줄", "오늘 걸으면서 좋았던 장면을 한 줄로 남겨보세요.", WalkSessionMission.ProofType.text, "✍️", 80, "기분 기록 스탬프"));

    if (hint.contains("park") || hint.contains("tree") || hint.contains("nature") || hint.contains("forest") || hint.contains("mountain")) {
      candidates.add(new MissionTemplate("three_trees", "나무 3그루 한 번에 찍기", "한 장면 안에 나무가 여러 그루 들어오게 사진을 남겨보세요.", WalkSessionMission.ProofType.photo, "🌳", 140, "초록 발견 스탬프"));
      candidates.add(new MissionTemplate("ginkgo", "은행나무 또는 노란 잎 찾기", "은행나무가 없다면 노란 잎이나 초록 잎을 찍어도 좋아요.", WalkSessionMission.ProofType.photo, "🍂", 130, "계절 산책 스탬프"));
    }

    if (hint.contains("city") || hint.contains("urban") || hint.contains("station") || hint.contains("street")) {
      candidates.add(new MissionTemplate("street_corner", "오늘의 길모퉁이", "자주 지나치던 길모퉁이를 여행지처럼 찍어보세요.", WalkSessionMission.ProofType.photo, "🧭", 110, "동네 여행 스탬프"));
      candidates.add(new MissionTemplate("shop_window", "가게 창문 속 색 찾기", "산책길의 쇼윈도나 작은 가게에서 마음에 드는 색을 찾아보세요.", WalkSessionMission.ProofType.photo, "🪟", 110, "색 발견 스탬프"));
    }

    candidates.sort(Comparator.comparing(MissionTemplate::key));
    int offset = Math.floorMod(date.getDayOfYear(), candidates.size());
    List<MissionTemplate> rotated = new ArrayList<>();
    for (int i = 0; i < candidates.size(); i++) {
      rotated.add(candidates.get((i + offset) % candidates.size()));
    }
    return rotated;
  }

  private void validateProof(WalkSessionMission mission, MissionProofRequest request) {
    if (mission.getProofType() == WalkSessionMission.ProofType.photo
        || mission.getProofType() == WalkSessionMission.ProofType.screenshot) {
      if (!StringUtils.hasText(request.imageKey())) {
        throw new SessionException(SessionErrorCode.INVALID_PROOF);
      }
      return;
    }

    if (mission.getProofType() == WalkSessionMission.ProofType.text
        || mission.getProofType() == WalkSessionMission.ProofType.social) {
      if (!StringUtils.hasText(request.text())) {
        throw new SessionException(SessionErrorCode.INVALID_PROOF);
      }
    }
  }

  private WalkSessionMission.VerificationStatus resolveVerificationStatus(
      WalkSessionMission mission, MissionProofRequest request) {
    if (mission.getProofType() == WalkSessionMission.ProofType.session) {
      return WalkSessionMission.VerificationStatus.verified;
    }
    if (mission.getProofType() == WalkSessionMission.ProofType.photo
        || mission.getProofType() == WalkSessionMission.ProofType.screenshot) {
      return WalkSessionMission.VerificationStatus.fallback_accepted;
    }
    return WalkSessionMission.VerificationStatus.verified;
  }

  private Long createStoryIfShareable(WalkSession session, WalkSessionMission mission) {
    if (!StringUtils.hasText(mission.getImageKey()) && !StringUtils.hasText(mission.getTextProof())) {
      return null;
    }

    MissionStory story =
        MissionStory.builder()
            .sessionId(session.getId())
            .sessionMissionId(mission.getId())
            .userId(session.getUserId())
            .cityId(session.getCityId())
            .title(mission.getTitle())
            .content(
                StringUtils.hasText(mission.getTextProof())
                    ? mission.getTextProof()
                    : mission.getTitle() + " 인증을 남겼어요.")
            .imageKey(mission.getImageKey())
            .visibility(MissionStory.Visibility.friends)
            .build();
    storyRepository.save(story);
    return story.getId();
  }

  private TodaySessionResponse toTodayResponse(WalkSession session) {
    City city = resolveCity(session.getCityId());
    List<SessionMissionResponse> missions =
        missionRepository.findBySessionIdOrderBySortOrderAsc(session.getId()).stream()
            .map(this::toMissionResponse)
            .toList();

    return new TodaySessionResponse(
        session.getId(),
        session.getSessionDate(),
        session.getStatus().name(),
        session.getActivityType().name(),
        city.getId(),
        city.getName(),
        city.getCountryFlag(),
        session.getGoalMeters(),
        session.getDistanceMeters(),
        session.getBonusMeters(),
        progressMeters(session),
        progressPercent(session),
        session.getDurationSeconds(),
        session.getTicketsEarned(),
        session.getStampsEarned(),
        session.getEnvironmentHint(),
        session.getPlaylistTitle(),
        session.getPlaylistUrl(),
        session.getStartedAt(),
        session.getEndedAt(),
        missions);
  }

  private SessionMissionResponse toMissionResponse(WalkSessionMission mission) {
    return new SessionMissionResponse(
        mission.getId(),
        mission.getMissionKey(),
        mission.getTitle(),
        mission.getDescription(),
        mission.getProofType().name(),
        mission.getEmoji(),
        mission.getBonusMeters(),
        mission.getStampReward(),
        mission.getStatus().name(),
        mission.getVerificationStatus().name(),
        s3Service.resolvePublicUrl(mission.getImageKey()),
        mission.getCompletedAt());
  }

  private StoryResponse toStoryResponse(MissionStory story) {
    User author = userRepository.findById(story.getUserId()).orElse(null);
    String name = author != null && author.isActive() ? author.getName() : "탈퇴한 사용자";
    String avatarUrl =
        author != null && author.isActive() ? s3Service.resolvePublicUrl(author.getAvatarUrl()) : null;
    return new StoryResponse(
        story.getId(),
        story.getUserId(),
        name,
        avatarUrl,
        story.getCityId(),
        story.getTitle(),
        story.getContent(),
        s3Service.resolvePublicUrl(story.getImageKey()),
        story.getImageKey(),
        story.getCreatedAt());
  }

  private int calculateTickets(WalkSession session) {
    int progress = progressMeters(session);
    if (progress <= 0 && session.getDurationSeconds() <= 0) {
      return 0;
    }

    int distanceTickets = Math.min(4, session.getDistanceMeters() / 250);
    int missionTickets = session.getStampsEarned();
    int completionBonus = progress >= session.getGoalMeters() ? 2 : 0;
    return Math.min(10, Math.max(1, distanceTickets + missionTickets + completionBonus));
  }

  private int progressMeters(WalkSession session) {
    return Math.max(0, session.getDistanceMeters() + session.getBonusMeters());
  }

  private int progressPercent(WalkSession session) {
    if (session.getGoalMeters() <= 0) {
      return 0;
    }
    return Math.min(100, (int) Math.round(progressMeters(session) * 100.0 / session.getGoalMeters()));
  }

  private int secondsBetween(LocalDateTime start, LocalDateTime end) {
    if (start == null || end == null || end.isBefore(start)) {
      return 0;
    }
    return (int) java.time.Duration.between(start, end).toSeconds();
  }

  private WalkSession findSession(Long userId, Long sessionId) {
    return sessionRepository
        .findByIdAndUserId(sessionId, userId)
        .orElseThrow(() -> new SessionException(SessionErrorCode.SESSION_NOT_FOUND));
  }

  private User findUser(Long userId) {
    return userRepository
        .findById(userId)
        .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
  }

  private City resolveCity(String cityId) {
    if (StringUtils.hasText(cityId)) {
      return cityRepository.findById(cityId).orElseGet(this::firstCity);
    }
    return cityRepository.findById("seoul").orElseGet(this::firstCity);
  }

  private City firstCity() {
    return cityRepository
        .findAllByOrderBySortOrderAsc()
        .stream()
        .findFirst()
        .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
  }

  private WalkSession.ActivityType parseActivityType(String raw) {
    if (!StringUtils.hasText(raw)) {
      return WalkSession.ActivityType.walk;
    }
    try {
      return WalkSession.ActivityType.valueOf(raw.toLowerCase());
    } catch (IllegalArgumentException exception) {
      throw new SessionException(SessionErrorCode.INVALID_ACTIVITY_TYPE);
    }
  }

  private String normalizeEnvironmentHint(String raw) {
    if (!StringUtils.hasText(raw)) {
      return "city";
    }
    String trimmed = raw.trim();
    return trimmed.length() > 100 ? trimmed.substring(0, 100) : trimmed;
  }

  private void validateLocation(Double latitude, Double longitude) {
    if (latitude == null
        || longitude == null
        || latitude < -90
        || latitude > 90
        || longitude < -180
        || longitude > 180) {
      throw new SessionException(SessionErrorCode.INVALID_LOCATION);
    }
  }

  private boolean isUsableAccuracy(Double accuracyMeters) {
    return accuracyMeters == null || accuracyMeters <= MAX_GPS_ACCURACY_METERS;
  }

  private boolean isUsableAccuracy(BigDecimal accuracyMeters) {
    return accuracyMeters == null || accuracyMeters.doubleValue() <= MAX_GPS_ACCURACY_METERS;
  }

  private int haversineMeters(SessionLocation previous, double latitude, double longitude) {
    double earthRadius = 6371000;
    double lat1 = Math.toRadians(previous.getLatitude().doubleValue());
    double lat2 = Math.toRadians(latitude);
    double deltaLat = Math.toRadians(latitude - previous.getLatitude().doubleValue());
    double deltaLng = Math.toRadians(longitude - previous.getLongitude().doubleValue());

    double a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
            + Math.cos(lat1)
                * Math.cos(lat2)
                * Math.sin(deltaLng / 2)
                * Math.sin(deltaLng / 2);
    double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (int) Math.round(earthRadius * c);
  }

  private LocalDateTime toLocalDateTime(OffsetDateTime value) {
    if (value == null) {
      return LocalDateTime.now(SERVICE_ZONE);
    }
    return value.atZoneSameInstant(SERVICE_ZONE).toLocalDateTime();
  }

  private String blankToNull(String value) {
    return StringUtils.hasText(value) ? value.trim() : null;
  }

  private record MissionTemplate(
      String key,
      String title,
      String description,
      WalkSessionMission.ProofType proofType,
      String emoji,
      int bonusMeters,
      String stampReward) {}
}
