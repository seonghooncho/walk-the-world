package com.walkworld.api.domain.post.converter;

import com.walkworld.api.domain.post.dto.CommentResponse;
import com.walkworld.api.domain.post.dto.PostResponse;
import com.walkworld.api.domain.post.entity.Comment;
import com.walkworld.api.domain.post.entity.Post;
import com.walkworld.api.domain.user.entity.User;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class PostConverter {

    public static PostResponse toPostResponse(
            Post post,
            User author,
            long likeCount,
            long commentCount,
            boolean isLiked,
            String imageUrl,
            String authorAvatarUrl) {
        PostResponse.ImageDetail imageDetail = null;
        if (post.getImageKey() != null && imageUrl != null) {
            imageDetail = PostResponse.ImageDetail.builder()
                    .url(imageUrl)
                    .key(post.getImageKey())
                    .build();
        }

        return PostResponse.builder()
                .id(post.getId())
                .userId(post.getUserId())
                .userName(author != null && author.isActive() ? author.getName() : "탈퇴한 사용자")
                .userAvatarUrl(authorAvatarUrl)
                .cityId(post.getCityId())
                .content(post.getContent())
                .image(imageDetail)
                .likes(likeCount)
                .comments(commentCount)
                .isLiked(isLiked)
                .createdAt(post.getCreatedAt())
                .build();
    }

    public static CommentResponse toCommentResponse(
            Comment comment, User author, String authorAvatarUrl) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .userName(author != null && author.isActive() ? author.getName() : "탈퇴한 사용자")
                .userAvatarUrl(authorAvatarUrl)
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
