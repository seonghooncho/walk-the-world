package com.walkworld.api.domain.city.repository;

import com.walkworld.api.domain.city.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, String> {
    List<City> findAllByOrderBySortOrderAsc();
}
