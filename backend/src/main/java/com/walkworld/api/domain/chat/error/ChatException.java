package com.walkworld.api.domain.chat.error;

import com.walkworld.api.global.error.CustomException;

public class ChatException extends CustomException {

  public ChatException(ChatErrorCode errorCode) {
    super(errorCode);
  }
}
