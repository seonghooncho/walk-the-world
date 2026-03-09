package com.walkworld.api.domain.post.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.walkworld.api.domain.post.dto.PostResponse;
import com.walkworld.api.domain.post.service.PostService;
import com.walkworld.api.global.auth.CurrentUserIdArgumentResolver;
import com.walkworld.api.global.error.GlobalExceptionHandler;
import com.walkworld.api.global.response.ApiResponse;
import java.time.LocalDateTime;
import java.util.List;
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
class PostControllerTest {

  @Mock private PostService postService;

  private MockMvc mockMvc;

  @BeforeEach
  void setUp() {
    mockMvc =
        MockMvcBuilders.standaloneSetup(new PostController(postService))
            .setCustomArgumentResolvers(new CurrentUserIdArgumentResolver())
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
  }

  @AfterEach
  void tearDown() {
    SecurityContextHolder.clearContext();
  }

  @Test
  void getPostsUsesAuthenticatedUserId() throws Exception {
    SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(7L, null));

    PostResponse post =
        PostResponse.builder()
            .id(1L)
            .userId(7L)
            .userName("tester")
            .cityId("seoul")
            .content("hello")
            .likes(0L)
            .comments(0L)
            .isLiked(false)
            .createdAt(LocalDateTime.of(2026, 3, 9, 11, 0))
            .build();

    when(postService.getPosts(7L, null, "all", null, 20)).thenReturn(ApiResponse.ok(List.of(post)));

    mockMvc
        .perform(get("/api/posts/v1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.success").value(true))
        .andExpect(jsonPath("$.data[0].userId").value(7))
        .andExpect(jsonPath("$.data[0].content").value("hello"));

    verify(postService).getPosts(7L, null, "all", null, 20);
  }
}
