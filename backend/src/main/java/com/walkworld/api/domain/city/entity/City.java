package com.walkworld.api.domain.city.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cities")
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class City {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "country_flag", length = 10)
    private String countryFlag;

    @Column(name = "steps_required", nullable = false)
    @Builder.Default
    private Long stepsRequired = 0L;

    @Column(precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(precision = 10, scale = 6)
    private BigDecimal lng;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "city_foods", joinColumns = @JoinColumn(name = "city_id"))
    @Column(name = "name")
    @Builder.Default
    private List<String> foods = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "city_landmarks", joinColumns = @JoinColumn(name = "city_id"))
    @Column(name = "name")
    @Builder.Default
    private List<String> landmarks = new ArrayList<>();
}
