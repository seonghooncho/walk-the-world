package com.walkworld.api.domain.friend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.walkworld.api.domain.currency.service.CurrencyService;
import com.walkworld.api.domain.friend.dto.AddFriendRequest;
import com.walkworld.api.domain.friend.error.FriendException;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.repository.UserRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FriendServiceTest {

  private FriendshipRepository friendshipRepository;
  private UserRepository userRepository;
  private FriendService friendService;

  @BeforeEach
  void setUp() {
    friendshipRepository = mock(FriendshipRepository.class);
    userRepository = mock(UserRepository.class);
    friendService =
        new FriendService(
            friendshipRepository,
            userRepository,
            mock(CurrencyService.class),
            mock(S3Service.class));
  }

  @Test
  void invalidFriendMethodReturnsDomainError() {
    AddFriendRequest request = new AddFriendRequest();
    request.setFriendId(2L);
    request.setMethod("unknown");

    when(friendshipRepository.existsByUserIdAndFriendId(1L, 2L)).thenReturn(false);
    when(userRepository.findById(2L)).thenReturn(Optional.of(User.builder().id(2L).name("friend").build()));

    FriendException exception = assertThrows(FriendException.class, () -> friendService.addFriend(1L, request));

    assertEquals("INVALID_FRIEND_METHOD", exception.getCode());
  }
}
