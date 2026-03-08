package com.walkworld.api.domain.city.service;

import com.walkworld.api.domain.city.dto.CityMemberResponse;
import com.walkworld.api.domain.city.dto.CityResponse;
import com.walkworld.api.domain.city.entity.City;
import com.walkworld.api.domain.city.repository.CityRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CityServiceImpl implements CityService {

    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    @Override
    public List<CityResponse> getAllCities() {
        return cityRepository.findAllByOrderBySortOrderAsc().stream()
                .map(c -> toCityResponse(c))
                .toList();
    }

    @Override
    public CityResponse getCity(String cityId) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND)); // reuse or create CityErrorCode
        return toCityResponse(city);
    }

    @Override
    public List<CityMemberResponse> getCityMembers(String cityId, Long currentUserId) {
        List<Long> friendIds = friendshipRepository.findFriendIdsByUserId(currentUserId);

        return userRepository.findAll().stream()
                .filter(u -> cityId.equals(u.getCurrentCityId()))
                .filter(u -> !u.getId().equals(currentUserId))
                .map(u -> CityMemberResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .avatarUrl(u.getAvatarUrl())
                        .totalSteps(u.getTotalSteps())
                        .isFriend(friendIds.contains(u.getId()))
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
