package com.walkworld.api.domain.friend.repository;

import com.walkworld.api.domain.friend.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    Optional<Friendship> findByUserIdAndFriendId(Long userId, Long friendId);
    boolean existsByUserIdAndFriendId(Long userId, Long friendId);

    @Query("SELECT f.friendId FROM Friendship f WHERE f.userId = :userId")
    List<Long> findFriendIdsByUserId(Long userId);

    List<Friendship> findByUserId(Long userId);
}
