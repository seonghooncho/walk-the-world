package com.walkworld.api.domain.post.repository;

import com.walkworld.api.domain.post.entity.Post;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // --- Cursor-based: all posts ---
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC, p.id DESC")
    List<Post> findAllLatest(Pageable pageable);

    @Query("""
        SELECT p FROM Post p
        WHERE (p.createdAt < :cursorCreatedAt OR (p.createdAt = :cursorCreatedAt AND p.id < :cursorId))
        ORDER BY p.createdAt DESC, p.id DESC
    """)
    List<Post> findAllCursor(LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);

    // --- Cursor-based: by city ---
    @Query("SELECT p FROM Post p WHERE p.cityId = :cityId ORDER BY p.createdAt DESC, p.id DESC")
    List<Post> findByCityLatest(String cityId, Pageable pageable);

    @Query("""
        SELECT p FROM Post p WHERE p.cityId = :cityId
        AND (p.createdAt < :cursorCreatedAt OR (p.createdAt = :cursorCreatedAt AND p.id < :cursorId))
        ORDER BY p.createdAt DESC, p.id DESC
    """)
    List<Post> findByCityCursor(String cityId, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);

    // --- Cursor-based: by user IDs (friends) ---
    @Query("SELECT p FROM Post p WHERE p.userId IN :userIds ORDER BY p.createdAt DESC, p.id DESC")
    List<Post> findByUserIdsLatest(List<Long> userIds, Pageable pageable);

    @Query("""
        SELECT p FROM Post p WHERE p.userId IN :userIds
        AND (p.createdAt < :cursorCreatedAt OR (p.createdAt = :cursorCreatedAt AND p.id < :cursorId))
        ORDER BY p.createdAt DESC, p.id DESC
    """)
    List<Post> findByUserIdsCursor(List<Long> userIds, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);

    // --- Cursor-based: my posts ---
    @Query("SELECT p FROM Post p WHERE p.userId = :userId ORDER BY p.createdAt DESC, p.id DESC")
    List<Post> findByUserLatest(Long userId, Pageable pageable);

    @Query("""
        SELECT p FROM Post p WHERE p.userId = :userId
        AND (p.createdAt < :cursorCreatedAt OR (p.createdAt = :cursorCreatedAt AND p.id < :cursorId))
        ORDER BY p.createdAt DESC, p.id DESC
    """)
    List<Post> findByUserCursor(Long userId, LocalDateTime cursorCreatedAt, Long cursorId, Pageable pageable);
}
