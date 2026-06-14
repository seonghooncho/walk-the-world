package com.walkworld.api.domain.session.error;

import com.walkworld.api.global.error.CustomException;

public class SessionException extends CustomException {
  public SessionException(SessionErrorCode errorCode) {
    super(errorCode);
  }
}
