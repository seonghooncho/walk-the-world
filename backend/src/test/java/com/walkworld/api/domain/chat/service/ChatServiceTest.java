package com.walkworld.api.domain.chat.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.walkworld.api.domain.chat.entity.ChatRoom;
import com.walkworld.api.domain.chat.entity.ChatMessage;
import com.walkworld.api.domain.chat.error.ChatException;
import com.walkworld.api.domain.chat.repository.ChatMessageRepository;
import com.walkworld.api.domain.chat.repository.ChatRoomRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.pagination.CursorCodec;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ChatServiceTest {

  private ChatRoomRepository roomRepository;
  private ChatMessageRepository messageRepository;
  private ChatService chatService;

  @BeforeEach
  void setUp() {
    roomRepository = mock(ChatRoomRepository.class);
    messageRepository = mock(ChatMessageRepository.class);
    chatService =
        new ChatService(
            roomRepository,
            messageRepository,
            mock(FriendshipRepository.class),
            mock(UserRepository.class),
            mock(S3Service.class),
            mock(CursorCodec.class));
  }

  @Test
  void nonParticipantCannotReadMessages() {
    when(roomRepository.findById(10L)).thenReturn(Optional.of(room()));

    ChatException exception =
        assertThrows(ChatException.class, () -> chatService.getMessages(3L, 10L, null, 20));

    assertEquals("CHAT403", exception.getCode());
  }

  @Test
  void nonParticipantCannotSendMessage() {
    when(roomRepository.findById(10L)).thenReturn(Optional.of(room()));

    ChatException exception =
        assertThrows(ChatException.class, () -> chatService.sendMessage(3L, 10L, "hello"));

    assertEquals("CHAT403", exception.getCode());
  }

  @Test
  void participantMessageIsTrimmedBeforeSaving() {
    when(roomRepository.findById(10L)).thenReturn(Optional.of(room()));
    ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);

    chatService.sendMessage(1L, 10L, "  hello  ");

    verify(messageRepository).save(messageCaptor.capture());
    assertEquals("hello", messageCaptor.getValue().getContent());
    verify(roomRepository).save(any());
  }

  private ChatRoom room() {
    return ChatRoom.builder().id(10L).user1Id(1L).user2Id(2L).build();
  }
}
