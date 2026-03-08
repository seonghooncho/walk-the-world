package com.walkworld.api.domain.city.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class CityResponse {
    private String id;
    private String name;
    private String country;
    private String countryFlag;
    private Long stepsRequired;
    private BigDecimal lat;
    private BigDecimal lng;
    private String description;
    private List<String> famousFood;
    private List<String> landmarks;
    private Boolean isUnlocked;
    private Integer onlineUsers;
}
