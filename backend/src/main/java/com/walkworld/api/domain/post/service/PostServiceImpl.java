package com.walkworld.api.domain.post.service;

import com.walkworld.api.domain.post.converter.PostConverter;
import com.walkworld.api.domain.post.dto.*;
import com.walkworld.api.domain.post.entity.Comment;
import com.walkworld.api.domain.post.entity.Post;
import com.walkworld.api.domain.post.error.PostErrorCode;
import com.walkworld.api.domain.post.error.PostException;
import com.walkworld.api.domain.post.repository.CommentRepository;
import com.walkworld.api.domain.post.repository.LikeRepository;
import com.walkworld.api.domain.post.repository.PostRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.pagination.Cursor;
import com.walkworld.api.global.pagination.CursorCodec;
import com.walkworld.api.global.response.ApiResponse;
import com.walkworld.api.domain.post.entity.Like;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;
    private final S3Service s3Service;
    private final CursorCodec cursorCodec;

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PostResponse>> getPosts(Long userId, String cityId, String filter, String cursorToken, int limit) {
        PageRequest pageable = PageRequest.of(0, limit + 1);
        List<Post> posts;

        if (cityId != null) {
            if (cursorToken != null && !cursorToken.isBlank()) {
                Cursor c = cursorCodec.decode(cursorToken);
                posts = postRepository.findByCityCursor(cityId, c.createdAt(), c.id(), pageable);
            } else {
                posts = postRepository.findByCityLatest(cityId, pageable);
            }
        } else if ("friends_only".equals(filter)) {
            List<Long> friendIds = friendshipRepository.findFriendIdsByUserId(userId);
            List<Long> userIds = new ArrayList<>(friendIds);
            userIds.add(userId);
            if (cursorToken != null && !cursorToken.isBlank()) {
                Cursor c = cursorCodec.decode(cursorToken);
                posts = postRepository.findByUserIdsCursor(userIds, c.createdAt(), c.id(), pageable);
            } else {
                posts = postRepository.findByUserIdsLatest(userIds, pageable);
            }
        } else {
            if (cursorToken != null && !cursorToken.isBlank()) {
                Cursor c = cursorCodec.decode(cursorToken);
                posts = postRepository.findAllCursor(c.createdAt(), c.id(), pageable);
            } else {
                posts = postRepository.findAllLatest(pageable);
            }
        }

        boolean hasNext = posts.size() > limit;
        if (hasNext) posts = posts.subList(0, limit);

        List<PostResponse> responses = posts.stream()
                .map(p -> buildPostResponse(p, userId))
                .toList();

        String nextCursor = null;
        if (hasNext && !posts.isEmpty()) {
            Post last = posts.get(posts.size() - 1);
            nextCursor = cursorCodec.encode(new Cursor(last.getId(), last.getCreatedAt()));
        }

        return ApiResponse.ok(responses, ApiResponse.PageMeta.builder()
                .limit(limit).hasNext(hasNext).nextCursor(nextCursor).build());
    }

    @Override
    @Transactional(readOnly = true)
    public PostResponse getPost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostException(PostErrorCode.POST_NOT_FOUND));
        return buildPostResponse(post, userId);
    }

    @Override
    public PostResponse createPost(Long userId, CreatePostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        Post post = Post.builder()
                .userId(userId)
                .cityId(request.getCityId() != null ? request.getCityId() : user.getCurrentCityId())
                .content(request.getContent())
                .build();

        if (request.getImageKey() != null && !request.getImageKey().isBlank()) {
            post.setImageKey(request.getImageKey());
        }

        postRepository.save(post);
        return buildPostResponse(post, userId);
    }

    @Override
    public void deletePost(Long userId, Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostException(PostErrorCode.POST_NOT_FOUND));
        if (!post.getUserId().equals(userId)) {
            throw new PostException(PostErrorCode.FORBIDDEN);
        }
        if (post.getImageKey() != null) {
            s3Service.deleteObject(post.getImageKey());
        }
        postRepository.delete(post);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<CommentResponse>> getComments(Long postId, String cursorToken, int limit) {
        PageRequest pageable = PageRequest.of(0, limit + 1);
        List<Comment> comments;

        if (cursorToken != null && !cursorToken.isBlank()) {
            Cursor c = cursorCodec.decode(cursorToken);
            comments = commentRepository.findByPostCursor(postId, c.createdAt(), c.id(), pageable);
        } else {
            comments = commentRepository.findByPostLatest(postId, pageable);
        }

        boolean hasNext = comments.size() > limit;
        if (hasNext) comments = comments.subList(0, limit);

        List<CommentResponse> responses = comments.stream()
                .map(this::buildCommentResponse)
                .toList();

        String nextCursor = null;
        if (hasNext && !comments.isEmpty()) {
            Comment last = comments.get(comments.size() - 1);
            nextCursor = cursorCodec.encode(new Cursor(last.getId(), last.getCreatedAt()));
        }

        return ApiResponse.ok(responses, ApiResponse.PageMeta.builder()
                .limit(limit).hasNext(hasNext).nextCursor(nextCursor).build());
    }

    @Override
    public CommentResponse addComment(Long userId, Long postId, CreateCommentRequest request) {
        postRepository.findById(postId)
                .orElseThrow(() -> new PostException(PostErrorCode.POST_NOT_FOUND));

        Comment comment = Comment.builder()
                .postId(postId)
                .userId(userId)
                .content(request.getContent())
                .build();
        commentRepository.save(comment);
        return buildCommentResponse(comment);
    }

    @Override
    public void deleteComment(Long userId, Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new PostException(PostErrorCode.COMMENT_NOT_FOUND));
        if (!comment.getUserId().equals(userId)) {
            throw new PostException(PostErrorCode.FORBIDDEN);
        }
        commentRepository.delete(comment);
    }

    @Override
    public LikeResponse toggleLike(Long userId, Long postId) {
        var existing = likeRepository.findByPostIdAndUserId(postId, userId);
        boolean isLiked;
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
            isLiked = false;
        } else {
            likeRepository.save(Like.builder().postId(postId).userId(userId).build());
            isLiked = true;
        }
        long count = likeRepository.countByPostId(postId);
        return LikeResponse.builder().isLiked(isLiked).likesCount(count).build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<PostResponse>> getMyPosts(Long userId, String cursorToken, int limit) {
        PageRequest pageable = PageRequest.of(0, limit + 1);
        List<Post> posts;

        if (cursorToken != null && !cursorToken.isBlank()) {
            Cursor c = cursorCodec.decode(cursorToken);
            posts = postRepository.findByUserCursor(userId, c.createdAt(), c.id(), pageable);
        } else {
            posts = postRepository.findByUserLatest(userId, pageable);
        }

        boolean hasNext = posts.size() > limit;
        if (hasNext) posts = posts.subList(0, limit);

        List<PostResponse> responses = posts.stream()
                .map(p -> buildPostResponse(p, userId))
                .toList();

        String nextCursor = null;
        if (hasNext && !posts.isEmpty()) {
            Post last = posts.get(posts.size() - 1);
            nextCursor = cursorCodec.encode(new Cursor(last.getId(), last.getCreatedAt()));
        }

        return ApiResponse.ok(responses, ApiResponse.PageMeta.builder()
                .limit(limit).hasNext(hasNext).nextCursor(nextCursor).build());
    }

    private PostResponse buildPostResponse(Post post, Long currentUserId) {
        User author = userRepository.findById(post.getUserId()).orElse(null);
        long likeCount = likeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());
        boolean isLiked = likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        String imageUrl = post.getImageKey() != null ? s3Service.generateDownloadUrl(post.getImageKey()) : null;

        return PostConverter.toPostResponse(post, author, likeCount, commentCount, isLiked, imageUrl);
    }

    private CommentResponse buildCommentResponse(Comment comment) {
        User author = userRepository.findById(comment.getUserId()).orElse(null);
        return PostConverter.toCommentResponse(comment, author);
    }
}
