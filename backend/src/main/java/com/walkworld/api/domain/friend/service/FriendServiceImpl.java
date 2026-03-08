package com.walkworld.api.domain.friend.service;

import com.walkworld.api.domain.currency.service.CurrencyService;
import com.walkworld.api.domain.friend.converter.FriendConverter;
import com.walkworld.api.domain.friend.dto.AddFriendRequest;
import com.walkworld.api.domain.friend.dto.FriendResponse;
import com.walkworld.api.domain.friend.entity.Friendship;
import com.walkworld.api.domain.friend.error.FriendErrorCode;
import com.walkworld.api.domain.friend.error.FriendException;
import com.walkworld.api.domain.friend.repository.FriendshipRepository;
import com.walkworld.api.domain.user.entity.User;
import com.walkworld.api.domain.user.error.UserErrorCode;
import com.walkworld.api.domain.user.error.UserException;
import com.walkworld.api.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FriendServiceImpl implements FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final CurrencyService currencyService;

    @Override
    @Transactional(readOnly = true)
    public List<FriendResponse> getFriends(Long userId) {
        List<Friendship> friendships = friendshipRepository.findByUserId(userId);
        return friendships.stream().map(f -> {
            User friend = userRepository.findById(f.getFriendId()).orElse(null);
            if (friend == null) return null;
            return FriendConverter.toFriendResponse(friend, f);
        }).filter(f -> f != null).toList();
    }

    @Override
    public FriendResponse addFriend(Long userId, AddFriendRequest request) {
        if (userId.equals(request.getFriendId())) {
            throw new FriendException(FriendErrorCode.SELF_FRIEND_REQUEST);
        }
        if (friendshipRepository.existsByUserIdAndFriendId(userId, request.getFriendId())) {
            throw new FriendException(FriendErrorCode.ALREADY_FRIENDS);
        }

        User friend = userRepository.findById(request.getFriendId())
                .orElseThrow(() -> new FriendException(FriendErrorCode.FRIEND_NOT_FOUND));

        Friendship.FriendMethod method = Friendship.FriendMethod.valueOf(
                request.getMethod() != null ? request.getMethod() : "same_city");

        switch (method) {
            case same_city -> currencyService.deductCoupon(userId, 1, "같은 도시 친구 추가");
            case different_city -> currencyService.deductHearts(userId, 2, "다른 도시 친구 추가");
            case qr -> { /* free */ }
        }

        friendshipRepository.save(Friendship.builder()
                .userId(userId).friendId(request.getFriendId()).method(method).build());
        friendshipRepository.save(Friendship.builder()
                .userId(request.getFriendId()).friendId(userId).method(method).build());

        return FriendConverter.toFriendResponse(friend, method.name());
    }

    @Override
    public void removeFriend(Long userId, Long friendId) {
        friendshipRepository.findByUserIdAndFriendId(userId, friendId)
                .ifPresent(friendshipRepository::delete);
        friendshipRepository.findByUserIdAndFriendId(friendId, userId)
                .ifPresent(friendshipRepository::delete);
    }
}
