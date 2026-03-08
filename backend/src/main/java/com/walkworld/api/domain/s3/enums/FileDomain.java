package com.walkworld.api.domain.s3.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileDomain {

    POSTS("posts"),
    MISSIONS("missions"),
    AVATARS("avatars"),
    COMPOSITE("composite"),
    CHAT("chat");

    private final String folder;
}
