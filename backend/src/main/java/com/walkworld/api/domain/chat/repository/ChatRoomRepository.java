package com.walkworld.api.domain.chat.repository;

import com.walkworld.api.domain.chat.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT r FROM ChatRoom r WHERE r.user1Id = :userId OR r.user2Id = :userId ORDER BY r.lastMessageAt DESC NULLS LAST")
    List<ChatRoom> findByUser(Long userId);

    @Query("SELECT r FROM ChatRoom r WHERE (r.user1Id = :a AND r.user2Id = :b) OR (r.user1Id = :b AND r.user2Id = :a)")
    Optional<ChatRoom> findByPair(Long a, Long b);
}
