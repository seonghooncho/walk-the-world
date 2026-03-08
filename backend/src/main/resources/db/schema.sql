-- ============================================================
-- WalkWorld Database Schema (MySQL 8.x)
-- ============================================================

CREATE DATABASE IF NOT EXISTS walkworld
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE walkworld;

-- -----------------------------------------------------------
-- 1. Users
-- -----------------------------------------------------------
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),
    name        VARCHAR(50)  NOT NULL,
    avatar_url  VARCHAR(500),
    total_steps BIGINT       NOT NULL DEFAULT 0,
    current_city_id VARCHAR(50),
    kakao_id    BIGINT       UNIQUE,
    google_id   VARCHAR(255) UNIQUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_kakao (kakao_id),
    INDEX idx_users_google (google_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 2. Refresh tokens
-- -----------------------------------------------------------
CREATE TABLE refresh_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    token      VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP    NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rt_token (token),
    INDEX idx_rt_user (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 3. User currency (coupons & hearts)
-- -----------------------------------------------------------
CREATE TABLE user_currency (
    user_id BIGINT PRIMARY KEY,
    coupons INT NOT NULL DEFAULT 0,
    hearts  INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 4. Currency transaction log
-- -----------------------------------------------------------
CREATE TABLE currency_transactions (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    currency_type ENUM('coupon','heart') NOT NULL,
    amount     INT          NOT NULL,
    reason     VARCHAR(200),
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ct_user (user_id),
    INDEX idx_ct_user_created (user_id, created_at DESC)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 5. Cities (reference data)
-- -----------------------------------------------------------
CREATE TABLE cities (
    id             VARCHAR(50)  PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    country        VARCHAR(100) NOT NULL,
    country_flag   VARCHAR(10),
    steps_required BIGINT       NOT NULL DEFAULT 0,
    lat            DECIMAL(10,6),
    lng            DECIMAL(10,6),
    description    TEXT,
    sort_order     INT          NOT NULL DEFAULT 0
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 6. City foods (1:N)
-- -----------------------------------------------------------
CREATE TABLE city_foods (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id VARCHAR(50)  NOT NULL,
    name    VARCHAR(100) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 7. City landmarks (1:N)
-- -----------------------------------------------------------
CREATE TABLE city_landmarks (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    city_id VARCHAR(50)  NOT NULL,
    name    VARCHAR(100) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 8. Missions
-- -----------------------------------------------------------
CREATE TABLE missions (
    id             VARCHAR(50)  PRIMARY KEY,
    city_id        VARCHAR(50)  NOT NULL,
    type           ENUM('photo','food','writing','explore','social') NOT NULL,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    image_url      VARCHAR(500),
    steps_required BIGINT       NOT NULL DEFAULT 0,
    emoji          VARCHAR(10),
    reward         VARCHAR(200),
    ai_composite   BOOLEAN      NOT NULL DEFAULT FALSE,
    ai_prompt      TEXT,
    sort_order     INT          NOT NULL DEFAULT 0,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_missions_city (city_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 9. User mission progress
-- -----------------------------------------------------------
CREATE TABLE user_missions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT      NOT NULL,
    mission_id          VARCHAR(50) NOT NULL,
    status              ENUM('locked','available','completed') NOT NULL DEFAULT 'locked',
    completed_at        TIMESTAMP   NULL,
    composite_image_url VARCHAR(500),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_mission (user_id, mission_id),
    INDEX idx_um_user (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 10. Posts
-- -----------------------------------------------------------
CREATE TABLE posts (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT      NOT NULL,
    city_id             VARCHAR(50) NOT NULL,
    content             TEXT        NOT NULL,
    image_key           VARCHAR(500),
    created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    INDEX idx_posts_user (user_id),
    INDEX idx_posts_city (city_id),
    INDEX idx_posts_created (created_at DESC, id DESC)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 11. Comments
-- -----------------------------------------------------------
CREATE TABLE comments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    content    TEXT   NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_comments_post (post_id, created_at ASC)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 12. Likes
-- -----------------------------------------------------------
CREATE TABLE likes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id    BIGINT NOT NULL,
    user_id    BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_like (post_id, user_id),
    INDEX idx_likes_post (post_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 13. Friendships
-- -----------------------------------------------------------
CREATE TABLE friendships (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT NOT NULL,
    friend_id  BIGINT NOT NULL,
    method     ENUM('same_city','different_city','qr') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_friendship (user_id, friend_id),
    INDEX idx_friendships_user (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 14. Step sync log
-- -----------------------------------------------------------
CREATE TABLE step_sync_log (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT    NOT NULL,
    steps      BIGINT    NOT NULL,
    synced_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ssl_user (user_id),
    INDEX idx_ssl_user_date (user_id, synced_at)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 15. User badges
-- -----------------------------------------------------------
CREATE TABLE user_badges (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT      NOT NULL,
    mission_id VARCHAR(50) NOT NULL,
    city_id    VARCHAR(50) NOT NULL,
    title      VARCHAR(200) NOT NULL,
    emoji      VARCHAR(10),
    earned_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id),
    UNIQUE KEY uk_user_badge (user_id, mission_id),
    INDEX idx_ub_user (user_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 16. Chat rooms
-- -----------------------------------------------------------
CREATE TABLE chat_rooms (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user1_id        BIGINT NOT NULL,
    user2_id        BIGINT NOT NULL,
    last_message    TEXT,
    last_message_at TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_chat_pair (user1_id, user2_id),
    INDEX idx_cr_user1 (user1_id),
    INDEX idx_cr_user2 (user2_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------
-- 17. Chat messages
-- -----------------------------------------------------------
CREATE TABLE chat_messages (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_id    BIGINT NOT NULL,
    sender_id  BIGINT NOT NULL,
    content    TEXT   NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_cm_room (room_id, created_at DESC),
    INDEX idx_cm_unread (room_id, sender_id, is_read)
) ENGINE=InnoDB;
