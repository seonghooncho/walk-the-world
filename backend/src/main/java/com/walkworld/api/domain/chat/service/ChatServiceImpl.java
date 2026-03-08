package com.walkworld.api.domain.chat.service;

import com.walkworld.api.domain.chat.dto.ChatMessageResponse;
import com.walkworld.api.domain.chat.dto.ChatRoomResponse;
import com.walkworld.api.domain.chat.entity.ChatMessage;
import com.walkworld.api.domain.chat.entity.ChatRoom;
import com.walkworld.api.domain.chat.repository.ChatMessageRepository;
import com.walkworld.api.domain.chat.repository.ChatRoomRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import com.walkworld.api.global.pagination.Cursor;
import com.walkworld.api.global.pagination.CursorCodec;
import com.walkworld.api.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository roomRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CursorCodec cursorCodec;

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomResponse> getRooms(Long userId) {
        return roomRepository.findByUser(userId).stream().map(room -> {
            Long friendId = room.getUser1Id().equals(userId) ? room.getUser2Id() : room.getUser1Id();
            User friend = userRepository.findById(friendId).orElse(null);
            long unread = messageRepository.countByRoomIdAndSenderIdNotAndIsReadFalse(room.getId(), userId);

            return ChatRoomResponse.builder()
                    .id(room.getId())
                    .friendId(friendId)
                    .friendName(friend != null ? friend.getName() : "Unknown")
                    .friendAvatar(friend != null ? friend.getAvatarUrl() : null)
                    .lastMessage(room.getLastMessage())
                    .lastMessageAt(room.getLastMessageAt())
                    .unreadCount(unread)
                    .build();
        }).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<ChatMessageResponse>> getMessages(Long userId, Long roomId, String cursorToken, int limit) {
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

        return ApiResponse.ok(responses, ApiResponse.PageMeta.builder()
                .limit(limit).hasNext(hasNext).nextCursor(nextCursor).build());
    }

    @Override
    public ChatMessageResponse sendMessage(Long userId, Long roomId, String content) {
        ChatRoom room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("채팅방을 찾을 수 없습니다"));

        ChatMessage msg = ChatMessage.builder()
                .roomId(roomId)
                .senderId(userId)
                .content(content)
                .build();
        messageRepository.save(msg);

        room.setLastMessage(content);
        room.setLastMessageAt(msg.getCreatedAt() != null ? msg.getCreatedAt() : LocalDateTime.now());
        roomRepository.save(room);

        return toResponse(msg);
    }

    @Override
    public void markAsRead(Long userId, Long roomId) {
        messageRepository.markAsRead(roomId, userId);
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
