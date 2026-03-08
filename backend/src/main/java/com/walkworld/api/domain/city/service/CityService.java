package com.walkworld.api.domain.city.service;

import com.walkworld.api.domain.city.dto.CityMemberResponse;
import com.walkworld.api.domain.city.dto.CityResponse;

import java.util.List;

public interface CityService {
    List<CityResponse> getAllCities();
    CityResponse getCity(String cityId);
    List<CityMemberResponse> getCityMembers(String cityId, Long currentUserId);
}
