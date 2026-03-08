package com.walkworld.api.domain.chat.repository;

import com.walkworld.api.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("""
        SELECT m FROM ChatMessage m WHERE m.roomId = :roomId
        AND (:cursorCreatedAt IS NULL OR m.createdAt < :cursorCreatedAt
             OR (m.createdAt = :cursorCreatedAt AND m.id < :cursorId))
        ORDER BY m.createdAt DESC, m.id DESC
    """)
    List<ChatMessage> findByRoomCursor(Long roomId, LocalDateTime cursorCreatedAt, Long cursorId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT m FROM ChatMessage m WHERE m.roomId = :roomId ORDER BY m.createdAt DESC, m.id DESC")
    List<ChatMessage> findByRoomLatest(Long roomId, org.springframework.data.domain.Pageable pageable);

    long countByRoomIdAndSenderIdNotAndIsReadFalse(Long roomId, Long userId);

    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.roomId = :roomId AND m.senderId <> :userId AND m.isRead = false")
    void markAsRead(Long roomId, Long userId);
}
