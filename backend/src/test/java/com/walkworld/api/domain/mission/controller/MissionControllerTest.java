package com.walkworld.api.domain.mission.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.walkworld.api.domain.mission.dto.MissionResponse;
import com.walkworld.api.domain.mission.service.MissionService;
import com.walkworld.api.global.auth.CurrentUserIdArgumentResolver;
import com.walkworld.api.global.error.GlobalExceptionHandler;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class MissionControllerTest {

  @Mock private MissionService missionService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new MissionController(missionService))
            .setCustomArgumentResolvers(new CurrentUserIdArgumentResolver())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void getMissionsUsesAuthenticatedUserId() throws Exception {
    SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(3L, null));

    MissionResponse mission =
        MissionResponse.builder()
            .id("mission-1")
            .cityId("seoul")
            .title("남산 타워 방문")
            .status("available")
            .build();

    when(missionService.getMissions(3L, null, null)).thenReturn(Map.of("seoul", List.of(mission)));

    mockMvc
        .perform(get("/api/missions/v1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data.seoul[0].id").value("mission-1"))
        .andExpect(jsonPath("$.data.seoul[0].title").value("남산 타워 방문"));

    verify(missionService).getMissions(3L, null, null);
  }
}
