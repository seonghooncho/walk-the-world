package com.walkworld.api.global.pagination;

import java.time.LocalDateTime;

public record Cursor(Long id, LocalDateTime createdAt) {}
