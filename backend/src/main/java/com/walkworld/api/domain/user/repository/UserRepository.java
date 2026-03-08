package com.walkworld.api.domain.user.repository;

import com.walkworld.api.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByKakaoId(Long kakaoId);
    Optional<User> findByGoogleId(String googleId);
}
