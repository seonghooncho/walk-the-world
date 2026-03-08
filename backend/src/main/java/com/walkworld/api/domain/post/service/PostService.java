package com.walkworld.api.domain.post.service;

import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.post.dto.*;

import java.util.List;

public interface PostService {
    ApiResponse<List<PostResponse>> getPosts(Long userId, String cityId, String filter, String cursor, int limit);
    PostResponse getPost(Long userId, Long postId);
    PostResponse createPost(Long userId, CreatePostRequest request);
    void deletePost(Long userId, Long postId);
    ApiResponse<List<CommentResponse>> getComments(Long postId, String cursor, int limit);
    CommentResponse addComment(Long userId, Long postId, CreateCommentRequest request);
    void deleteComment(Long userId, Long commentId);
    LikeResponse toggleLike(Long userId, Long postId);
    ApiResponse<List<PostResponse>> getMyPosts(Long userId, String cursor, int limit);
}
