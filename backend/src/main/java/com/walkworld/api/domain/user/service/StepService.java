package com.walkworld.api.domain.user.service;

import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.user.dto.StepHistoryResponse;
import com.walkworld.api.domain.user.dto.StepSyncRequest;
import com.walkworld.api.domain.user.dto.StepSyncResponse;
import com.walkworld.api.domain.user.entity.StepSyncLog;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.StepSyncLogRepository;
import com.walkworld.api.domain.user.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class StepService {

  private final UserRepository userRepository;
  private final CityRepository cityRepository;
  private final StepSyncLogRepository stepSyncLogRepository;

  public StepSyncResponse syncSteps(Long userId, StepSyncRequest request) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    Long previousSteps = user.getTotalSteps();
    user.setTotalSteps(request.getSteps());

    stepSyncLogRepository.save(StepSyncLog.builder().userId(userId).steps(request.getSteps()).build());

    List<City> cities = cityRepository.findAllByOrderBySortOrderAsc();
    List<String> newlyUnlocked = new ArrayList<>();

    for (City city : cities) {
      if (previousSteps < city.getStepsRequired()
          && request.getSteps() >= city.getStepsRequired()) {
        newlyUnlocked.add(city.getId());
      }
    }

    City currentCity = resolveCurrentCity(cities, request.getSteps());
    user.setCurrentCityId(currentCity.getId());
    userRepository.save(user);

    return buildStepResponse(user, cities, currentCity, newlyUnlocked);
  }

  @Transactional(readOnly = true)
  public StepSyncResponse getStepInfo(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    List<City> cities = cityRepository.findAllByOrderBySortOrderAsc();
    City currentCity = resolveCurrentCity(cities, user.getTotalSteps());

    return buildStepResponse(user, cities, currentCity, List.of());
  }

  @Transactional(readOnly = true)
  public StepHistoryResponse getHistory(Long userId, LocalDate from, LocalDate to) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

    LocalDateTime fromDateTime = from.atStartOfDay();
    LocalDateTime toDateTime = to.atTime(LocalTime.MAX);
    List<StepSyncLog> logs = stepSyncLogRepository.findByUserIdAndDateRange(userId, fromDateTime, toDateTime);

    Map<LocalDate, Long> dailyMax = new LinkedHashMap<>();
    for (StepSyncLog log : logs) {
      LocalDate date = log.getSyncedAt().toLocalDate();
      dailyMax.merge(date, log.getSteps(), Math::max);
    }

    List<StepHistoryResponse.DailyRecord> records =
        dailyMax.entrySet().stream()
            .map(
                entry ->
                    StepHistoryResponse.DailyRecord.builder()
                        .date(entry.getKey())
                        .steps(entry.getValue())
                        .build())
            .toList();

    long total = records.stream().mapToLong(StepHistoryResponse.DailyRecord::getSteps).sum();
    long average = records.isEmpty() ? 0 : total / records.size();

    return StepHistoryResponse.builder()
        .records(records)
        .totalSteps(user.getTotalSteps())
        .averageDaily(average)
        .build();
  }

  private City resolveCurrentCity(List<City> cities, Long steps) {
    City current = cities.get(0);
    for (City city : cities) {
      if (steps >= city.getStepsRequired()) {
        current = city;
      } else {
        break;
      }
    }
    return current;
  }

  private StepSyncResponse buildStepResponse(
      User user, List<City> cities, City currentCity, List<String> newlyUnlockedCities) {
    City nextCity = null;
    for (City city : cities) {
      if (user.getTotalSteps() < city.getStepsRequired()) {
        nextCity = city;
        break;
      }
    }

    double progressPercent = 100.0;
    long stepsToNextCity = 0;
    if (nextCity != null) {
      long range = nextCity.getStepsRequired() - currentCity.getStepsRequired();
      long progressedSteps = user.getTotalSteps() - currentCity.getStepsRequired();
      progressPercent = Math.min((double) progressedSteps / range * 100, 100.0);
      stepsToNextCity = nextCity.getStepsRequired() - user.getTotalSteps();
    }

    return StepSyncResponse.builder()
        .totalSteps(user.getTotalSteps())
        .currentCityId(currentCity.getId())
        .currentCityName(currentCity.getName())
        .nextCityId(nextCity != null ? nextCity.getId() : null)
        .nextCityName(nextCity != null ? nextCity.getName() : null)
        .stepsToNextCity(stepsToNextCity)
        .progressPercent(progressPercent)
        .newlyUnlockedCities(newlyUnlockedCities)
        .build();
  }
}
