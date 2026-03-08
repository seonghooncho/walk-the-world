package com.walkworld.api.domain.post.controller;

import com.walkworld.api.domain.post.dto.*;
import com.walkworld.api.domain.post.service.PostService;
import com.walkworld.api.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts/v1")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ApiResponse<List<PostResponse>> getPosts(
            Authentication auth,
            @RequestParam(required = false) String cityId,
            @RequestParam(required = false, defaultValue = "all") String filter,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        Long userId = (Long) auth.getPrincipal();
        return postService.getPosts(userId, cityId, filter, cursor, Math.min(limit, 100));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> createPost(
            Authentication auth,
            @Valid @RequestBody CreatePostRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(postService.createPost(userId, request));
    }

    @GetMapping("/me")
    public ApiResponse<List<PostResponse>> getMyPosts(
            Authentication auth,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int limit) {
        Long userId = (Long) auth.getPrincipal();
        return postService.getMyPosts(userId, cursor, Math.min(limit, 100));
    }

    @GetMapping("/{postId}")
    public ApiResponse<PostResponse> getPost(Authentication auth, @PathVariable Long postId) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(postService.getPost(userId, postId));
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(Authentication auth, @PathVariable Long postId) {
        Long userId = (Long) auth.getPrincipal();
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
            Authentication auth,
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(postService.addComment(userId, postId, request));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    public ApiResponse<Void> deleteComment(Authentication auth,
                                            @PathVariable Long postId,
                                            @PathVariable Long commentId) {
        Long userId = (Long) auth.getPrincipal();
        postService.deleteComment(userId, commentId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/{postId}/likes")
    public ApiResponse<LikeResponse> toggleLike(Authentication auth, @PathVariable Long postId) {
        Long userId = (Long) auth.getPrincipal();
        return ApiResponse.ok(postService.toggleLike(userId, postId));
    }
}
