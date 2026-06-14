package com.walkworld.api.domain.chat.service;

import com.walkworld.api.domain.chat.dto.ChatMessageResponse;
import com.walkworld.api.domain.chat.dto.ChatRoomResponse;
import com.walkworld.api.domain.chat.error.ChatErrorCode;
import com.walkworld.api.domain.chat.error.ChatException;
import com.walkworld.api.domain.chat.entity.ChatMessage;
import com.walkworld.api.domain.chat.entity.ChatRoom;
import com.walkworld.api.domain.chat.repository.ChatMessageRepository;
import com.walkworld.api.domain.chat.repository.ChatRoomRepository;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.s3.service.S3Service;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.pagination.Cursor;
import com.walkworld.api.global.pagination.CursorCodec;
import com.walkworld.api.global.response.ApiResponse;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

  private final ChatRoomRepository roomRepository;
  private final ChatMessageRepository messageRepository;
  private final FriendshipRepository friendshipRepository;
  private final UserRepository userRepository;
  private final S3Service s3Service;
  private final CursorCodec cursorCodec;

  @Transactional(readOnly = true)
  public List<ChatRoomResponse> getRooms(Long userId) {
    return roomRepository.findByUser(userId).stream()
        .map(room -> toRoomResponse(userId, room))
        .toList();
  }

  public ChatRoomResponse getOrCreateRoom(Long userId, Long friendId) {
    if (userId.equals(friendId)) {
      throw new ChatException(ChatErrorCode.SELF_CHAT_NOT_ALLOWED);
    }
    if (!friendshipRepository.existsByUserIdAndFriendId(userId, friendId)) {
      throw new ChatException(ChatErrorCode.CHAT_FORBIDDEN);
    }

    ChatRoom room =
        roomRepository
            .findByPair(userId, friendId)
            .orElseGet(
                () -> {
                  long user1Id = Math.min(userId, friendId);
                  long user2Id = Math.max(userId, friendId);
                  return roomRepository.save(
                      ChatRoom.builder().user1Id(user1Id).user2Id(user2Id).build());
                });

    return toRoomResponse(userId, room);
  }

  @Transactional(readOnly = true)
  public ApiResponse<List<ChatMessageResponse>> getMessages(
      Long userId, Long roomId, String cursorToken, int limit) {
    requireRoomParticipant(userId, roomId);

    PageRequest pageable = PageRequest.of(0, limit + 1);
    List<ChatMessage> messages;

    if (cursorToken != null && !cursorToken.isBlank()) {
      Cursor c = cursorCodec.decode(cursorToken);
      messages = messageRepository.findByRoomCursor(roomId, c.createdAt(), c.id(), pageable);
    } else {
      messages = messageRepository.findByRoomLatest(roomId, pageable);
    }

    boolean hasNext = messages.size() > limit;
    if (hasNext) messages = messages.subList(0, limit);

    List<ChatMessageResponse> responses = messages.stream().map(this::toResponse).toList();

    String nextCursor = null;
    if (hasNext && !messages.isEmpty()) {
      ChatMessage last = messages.get(messages.size() - 1);
      nextCursor = cursorCodec.encode(new Cursor(last.getId(), last.getCreatedAt()));
    }

    return ApiResponse.ok(
        responses,
        ApiResponse.PageMeta.builder()
            .limit(limit)
            .hasNext(hasNext)
            .nextCursor(nextCursor)
            .build());
  }

  public ChatMessageResponse sendMessage(Long userId, Long roomId, String content) {
    ChatRoom room = requireRoomParticipant(userId, roomId);
    String normalizedContent = content.trim();

    ChatMessage msg =
        ChatMessage.builder().roomId(roomId).senderId(userId).content(normalizedContent).build();
    messageRepository.save(msg);

    room.setLastMessage(normalizedContent);
    room.setLastMessageAt(msg.getCreatedAt() != null ? msg.getCreatedAt() : LocalDateTime.now());
    roomRepository.save(room);

    return toResponse(msg);
  }

  public void markAsRead(Long userId, Long roomId) {
    requireRoomParticipant(userId, roomId);
    messageRepository.markAsRead(roomId, userId);
  }

  private ChatRoom requireRoomParticipant(Long userId, Long roomId) {
    ChatRoom room =
        roomRepository
            .findById(roomId)
            .orElseThrow(() -> new ChatException(ChatErrorCode.CHAT_ROOM_NOT_FOUND));

    if (!room.getUser1Id().equals(userId) && !room.getUser2Id().equals(userId)) {
      throw new ChatException(ChatErrorCode.CHAT_FORBIDDEN);
    }

    return room;
  }

  private ChatRoomResponse toRoomResponse(Long userId, ChatRoom room) {
    Long friendId = room.getUser1Id().equals(userId) ? room.getUser2Id() : room.getUser1Id();
    User friend = userRepository.findById(friendId).orElse(null);
    long unread =
        messageRepository.countByRoomIdAndSenderIdNotAndIsReadFalse(room.getId(), userId);

    return ChatRoomResponse.builder()
        .id(room.getId())
        .friendId(friendId)
        .friendName(friend != null && friend.isActive() ? friend.getName() : "탈퇴한 사용자")
        .friendAvatar(
            friend != null && friend.isActive() ? s3Service.resolvePublicUrl(friend.getAvatarUrl()) : null)
        .lastMessage(room.getLastMessage())
        .lastMessageAt(room.getLastMessageAt())
        .unreadCount(unread)
        .build();
  }

  private ChatMessageResponse toResponse(ChatMessage m) {
    return ChatMessageResponse.builder()
        .id(m.getId())
        .senderId(m.getSenderId())
        .content(m.getContent())
        .read(m.getIsRead())
        .createdAt(m.getCreatedAt())
        .build();
  }
}
