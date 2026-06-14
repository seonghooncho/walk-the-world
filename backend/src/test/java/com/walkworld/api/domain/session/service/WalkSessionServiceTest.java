package com.walkworld.api.domain.session.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.currency.dto.CurrencyResponse;
import com.walkworld.api.domain.currency.service.CurrencyService;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.session.dto.FinishSessionResponse;
import com.walkworld.api.domain.session.dto.LocationPointRequest;
import com.walkworld.api.domain.session.dto.StartSessionRequest;
import com.walkworld.api.domain.session.dto.TodaySessionResponse;
import com.walkworld.api.domain.session.entity.SessionLocation;
import com.walkworld.api.domain.session.entity.WalkSession;
import com.walkworld.api.domain.session.entity.WalkSessionMission;
import com.walkworld.api.domain.session.repository.MissionStoryRepository;
import com.walkworld.api.domain.session.repository.SessionLocationRepository;
import com.walkworld.api.domain.session.repository.WalkSessionMissionRepository;
import com.walkworld.api.domain.session.repository.WalkSessionRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class WalkSessionServiceTest {

  private WalkSessionRepository sessionRepository;
  private SessionLocationRepository locationRepository;
  private WalkSessionMissionRepository missionRepository;
  private MissionStoryRepository storyRepository;
  private UserRepository userRepository;
  private CityRepository cityRepository;
  private CurrencyService currencyService;
  private WalkSessionService service;

  @BeforeEach
  void setUp() {
    sessionRepository = mock(WalkSessionRepository.class);
    locationRepository = mock(SessionLocationRepository.class);
    missionRepository = mock(WalkSessionMissionRepository.class);
    storyRepository = mock(MissionStoryRepository.class);
    userRepository = mock(UserRepository.class);
    cityRepository = mock(CityRepository.class);
    currencyService = mock(CurrencyService.class);

    service =
        new WalkSessionService(
            sessionRepository,
            locationRepository,
            missionRepository,
            storyRepository,
            userRepository,
            cityRepository,
            mock(FriendshipRepository.class),
            currencyService,
            mock(S3Service.class));

    when(userRepository.findById(1L))
        .thenReturn(
            Optional.of(
                User.builder()
                    .id(1L)
                    .email("qa@example.com")
                    .name("QA")
                    .currentCityId("seoul")
                    .build()));
    when(cityRepository.findById("seoul"))
        .thenReturn(
            Optional.of(
                City.builder()
                    .id("seoul")
                    .name("서울")
                    .country("대한민국")
                    .countryFlag("🇰🇷")
                    .build()));
  }

  @Test
  void startSessionCreatesFiveDailyMissions() {
    var savedMissions = new ArrayList<WalkSessionMission>();
    AtomicLong missionId = new AtomicLong(100);

    when(sessionRepository.findByUserIdAndSessionDate(eq(1L), any(LocalDate.class)))
        .thenReturn(Optional.empty());
    when(sessionRepository.save(any(WalkSession.class)))
        .thenAnswer(
            invocation -> {
              WalkSession session = invocation.getArgument(0);
              session.setId(10L);
              return session;
            });
    when(missionRepository.save(any(WalkSessionMission.class)))
        .thenAnswer(
            invocation -> {
              WalkSessionMission mission = invocation.getArgument(0);
              mission.setId(missionId.getAndIncrement());
              savedMissions.add(mission);
              return mission;
            });
    when(missionRepository.findBySessionIdOrderBySortOrderAsc(10L)).thenReturn(savedMissions);

    TodaySessionResponse response =
        service.startSession(1L, new StartSessionRequest("walk", null, "park", null));

    assertEquals(10L, response.sessionId());
    assertEquals("active", response.status());
    assertEquals(5, response.missions().size());
    assertTrue(response.missions().stream().allMatch(mission -> mission.id() != null));
    verify(missionRepository, times(5)).save(any(WalkSessionMission.class));
  }

  @Test
  void recordLocationIgnoresPoorAccuracyAndAddsUsableDistance() {
    WalkSession session =
        WalkSession.builder()
            .id(10L)
            .userId(1L)
            .sessionDate(LocalDate.now())
            .activityType(WalkSession.ActivityType.walk)
            .status(WalkSession.SessionStatus.active)
            .cityId("seoul")
            .goalMeters(1000)
            .distanceMeters(0)
            .bonusMeters(0)
            .startedAt(LocalDateTime.now().minusMinutes(1))
            .build();
    AtomicReference<SessionLocation> previous = new AtomicReference<>();

    when(sessionRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(session));
    when(locationRepository.findFirstBySessionIdOrderByRecordedAtDescIdDesc(10L))
        .thenAnswer(invocation -> Optional.ofNullable(previous.get()));
    when(locationRepository.save(any(SessionLocation.class)))
        .thenAnswer(
            invocation -> {
              SessionLocation location = invocation.getArgument(0);
              previous.set(location);
              return location;
            });

    var first =
        service.recordLocation(
            1L,
            10L,
            new LocationPointRequest(37.5665, 126.9780, 20.0, OffsetDateTime.now()));
    var second =
        service.recordLocation(
            1L,
            10L,
            new LocationPointRequest(37.5675, 126.9780, 20.0, OffsetDateTime.now()));
    var poor =
        service.recordLocation(
            1L,
            10L,
            new LocationPointRequest(37.5685, 126.9780, 150.0, OffsetDateTime.now()));

    assertEquals(0, first.distanceAddedMeters());
    assertTrue(second.distanceAddedMeters() > 0);
    assertEquals(0, poor.distanceAddedMeters());
    assertEquals(second.distanceAddedMeters(), session.getDistanceMeters());
  }

  @Test
  void finishSessionAwardsPartialTicketsOnce() {
    WalkSession session =
        WalkSession.builder()
            .id(10L)
            .userId(1L)
            .sessionDate(LocalDate.now())
            .activityType(WalkSession.ActivityType.walk)
            .status(WalkSession.SessionStatus.active)
            .cityId("seoul")
            .goalMeters(1000)
            .distanceMeters(400)
            .bonusMeters(160)
            .startedAt(LocalDateTime.now().minusMinutes(5))
            .build();

    when(sessionRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(session));
    when(missionRepository.countBySessionIdAndStatus(10L, WalkSessionMission.MissionStatus.completed))
        .thenReturn(1);
    when(currencyService.getCurrency(1L))
        .thenReturn(CurrencyResponse.builder().coupons(2).hearts(5).tickets(4).build());

    FinishSessionResponse response = service.finishSession(1L, 10L);

    assertEquals("abandoned", response.status());
    assertEquals(2, response.ticketsEarned());
    assertEquals(1, response.stampsEarned());
    verify(currencyService).awardTickets(1L, 2, "오늘의 산책 세션 보상");

    FinishSessionResponse second = service.finishSession(1L, 10L);
    assertEquals(2, second.ticketsEarned());
    verify(currencyService, times(1)).awardTickets(anyLong(), anyInt(), anyString());
  }
}
