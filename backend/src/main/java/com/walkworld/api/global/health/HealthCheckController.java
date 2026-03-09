package com.walkworld.api.global.health;

import com.walkworld.api.global.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthCheckController {

    @GetMapping({"/health", "/api/health"})
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.ok(Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString(),
                "service", "timelink-api"
        ));
    }
}
