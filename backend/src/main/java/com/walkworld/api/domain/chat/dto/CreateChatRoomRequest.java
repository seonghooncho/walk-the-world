package com.walkworld.api.domain.chat.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateChatRoomRequest {

  @NotNull
  private Long friendId;
}
