package com.walkworld.api.domain.post.repository;

import com.walkworld.api.domain.post.entity.Comment;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CommentRepository extends JpaRepository<Comment, Long> {

  @Query("SELECT c FROM Comment c WHERE c.postId = :postId ORDER BY c.createdAt DESC, c.id DESC")
  List<Comment> findByPostLatest(Long postId, Pageable pageable);

  @Query(
      """
    SELECT c FROM Comment c
    WHERE c.postId = :postId
    AND (c.createdAt < :cursorCreatedAt OR (c.createdAt = :cursorCreatedAt AND c.id < :cursorId))
    ORDER BY c.createdAt DESC, c.id DESC
""")
  List<Comment> findByPostCursor(
      Long postId, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);

  long countByPostId(Long postId);
}
