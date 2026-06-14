package com.walkworld.api.domain.user.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.walkworld.api.domain.auth.repository.RefreshTokenRepository;
import com.walkworld.api.domain.currency.repository.UserCurrencyRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.entity.UserStatus;
import com.walkworld.api.domain.user.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserServiceTest {

  private UserRepository userRepository;
  private RefreshTokenRepository refreshTokenRepository;
  private UserService userService;

  @BeforeEach
  void setUp() {
    userRepository = mock(UserRepository.class);
    refreshTokenRepository = mock(RefreshTokenRepository.class);
    userService =
        new UserService(
            userRepository,
            mock(UserCurrencyRepository.class),
            mock(FriendshipRepository.class),
            mock(S3Service.class),
            refreshTokenRepository);
  }

  @Test
  void withdrawAccountMarksUserWithdrawnAndDeletesRefreshTokens() {
    User user = User.builder().id(7L).email("tester@example.com").name("tester").build();
    when(userRepository.findById(7L)).thenReturn(Optional.of(user));

    userService.withdrawAccount(7L);

    assertEquals(UserStatus.withdrawn, user.getStatus());
    assertNotNull(user.getWithdrawnAt());
    verify(userRepository).save(user);
    verify(refreshTokenRepository).deleteByUserId(7L);
  }

  @Test
  void withdrawAccountDoesNotExtendGracePeriodWhenAlreadyWithdrawn() {
    LocalDateTime withdrawnAt = LocalDateTime.now().minusDays(10);
    User user =
        User.builder()
            .id(7L)
            .email("tester@example.com")
            .name("tester")
            .status(UserStatus.withdrawn)
            .withdrawnAt(withdrawnAt)
            .build();
    when(userRepository.findById(7L)).thenReturn(Optional.of(user));

    userService.withdrawAccount(7L);

    assertEquals(withdrawnAt, user.getWithdrawnAt());
    verify(userRepository, never()).save(user);
    verify(refreshTokenRepository).deleteByUserId(7L);
  }
}
