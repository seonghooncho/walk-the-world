package com.walkworld.api.domain.post.controller;

import com.walkworld.api.domain.post.dto.*;
import com.walkworld.api.domain.post.service.PostService;
import com.walkworld.api.global.auth.CurrentUserId;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/v1")
@RequiredArgsConstructor
public class PostController {

  private final PostService postService;

  @GetMapping
  public ApiResponse<List<PostResponse>> getPosts(
      @CurrentUserId Long userId,
      @RequestParam(required = false) String cityId,
      @RequestParam(required = false, defaultValue = "all") String filter,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int limit) {
    return postService.getPosts(userId, cityId, filter, cursor, Math.min(limit, 100));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<PostResponse> createPost(
      @CurrentUserId Long userId, @Valid @RequestBody CreatePostRequest request) {
    return ApiResponse.ok(postService.createPost(userId, request));
  }

  @GetMapping("/me")
  public ApiResponse<List<PostResponse>> getMyPosts(
      @CurrentUserId Long userId,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "20") int limit) {
    return postService.getMyPosts(userId, cursor, Math.min(limit, 100));
  }

  @GetMapping("/{postId}")
  public ApiResponse<PostResponse> getPost(@CurrentUserId Long userId, @PathVariable Long postId) {
    return ApiResponse.ok(postService.getPost(userId, postId));
  }

  @DeleteMapping("/{postId}")
  public ApiResponse<Void> deletePost(@CurrentUserId Long userId, @PathVariable Long postId) {
    postService.deletePost(userId, postId);
    return ApiResponse.ok(null);
  }

  @GetMapping("/{postId}/comments")
  public ApiResponse<List<CommentResponse>> getComments(
      @PathVariable Long postId,
      @RequestParam(required = false) String cursor,
      @RequestParam(defaultValue = "50") int limit) {
    return postService.getComments(postId, cursor, Math.min(limit, 100));
  }

  @PostMapping("/{postId}/comments")
  @ResponseStatus(HttpStatus.CREATED)
  public ApiResponse<CommentResponse> addComment(
      @CurrentUserId Long userId,
      @PathVariable Long postId,
      @Valid @RequestBody CreateCommentRequest request) {
    return ApiResponse.ok(postService.addComment(userId, postId, request));
  }

  @DeleteMapping("/{postId}/comments/{commentId}")
  public ApiResponse<Void> deleteComment(
      @CurrentUserId Long userId, @PathVariable Long postId, @PathVariable Long commentId) {
    postService.deleteComment(userId, commentId);
    return ApiResponse.ok(null);
  }

  @PostMapping("/{postId}/likes")
  public ApiResponse<LikeResponse> toggleLike(
      @CurrentUserId Long userId, @PathVariable Long postId) {
    return ApiResponse.ok(postService.toggleLike(userId, postId));
  }
}
