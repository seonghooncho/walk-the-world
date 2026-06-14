package com.walkworld.api.domain.story.controller;

import com.walkworld.api.domain.session.dto.StoryResponse;
import com.walkworld.api.domain.session.service.WalkSessionService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories/v1")
@RequiredArgsConstructor
public class StoryController {

  private final WalkSessionService walkSessionService;

  @GetMapping("/friends")
  public ApiResponse<List<StoryResponse>> getFriendStories(
      @CurrentUserId Long userId, @RequestParam(defaultValue = "20") int limit) {
    return walkSessionService.getFriendStories(userId, limit);
  }
}
