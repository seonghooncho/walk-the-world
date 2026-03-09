package com.walkworld.api.domain.city.service;

import com.walkworld.api.domain.city.dto.CityMemberResponse;
import com.walkworld.api.domain.city.dto.CityResponse;
import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CityService {

  private final CityRepository cityRepository;
  private final UserRepository userRepository;
  private final FriendshipRepository friendshipRepository;

  public List<CityResponse> getAllCities() {
    return cityRepository.findAllByOrderBySortOrderAsc().stream()
        .map(this::toCityResponse)
        .toList();
  }

  public CityResponse getCity(String cityId) {
    City city =
        cityRepository
            .findById(cityId)
            .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    return toCityResponse(city);
  }

  public List<CityMemberResponse> getCityMembers(String cityId, Long currentUserId) {
    List<Long> friendIds = friendshipRepository.findFriendIdsByUserId(currentUserId);

    return userRepository.findAll().stream()
        .filter(user -> cityId.equals(user.getCurrentCityId()))
        .filter(user -> !user.getId().equals(currentUserId))
        .map(
            user ->
                CityMemberResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .avatarUrl(user.getAvatarUrl())
                    .totalSteps(user.getTotalSteps())
                    .isFriend(friendIds.contains(user.getId()))
                    .build())
        .toList();
  }

  private CityResponse toCityResponse(City city) {
    return CityResponse.builder()
        .id(city.getId())
        .name(city.getName())
        .country(city.getCountry())
        .countryFlag(city.getCountryFlag())
        .stepsRequired(city.getStepsRequired())
        .lat(city.getLat())
        .lng(city.getLng())
        .description(city.getDescription())
        .famousFood(city.getFoods())
        .landmarks(city.getLandmarks())
        .build();
  }
}
