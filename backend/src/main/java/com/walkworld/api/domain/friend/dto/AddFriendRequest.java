package com.walkworld.api.domain.friend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddFriendRequest {
    @NotNull
    private Long friendId;

    /** same_city | different_city | qr */
    private String method;
}
