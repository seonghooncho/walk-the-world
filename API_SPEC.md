# timelink Backend API 명세서

> 버전: v1  
> Base URL: `api/{domain}/v1`  
> 인증: Bearer Token (Authorization 헤더)  
> 응답 형식: JSON  
> 날짜 형식: ISO 8601 (UTC)

---

## 목차

1. [공통 사항](#1-공통-사항)
2. [인증 (Auth)](#2-인증-auth)
3. [사용자 (Users)](#3-사용자-users)
4. [걸음 수 (Steps)](#4-걸음-수-steps)
5. [재화 (Currency)](#5-재화-currency)
6. [친구 (Friends)](#6-친구-friends)
7. [채팅 (Chat)](#7-채팅-chat)
8. [게시물 (Posts)](#8-게시물-posts)
9. [댓글 (Comments)](#9-댓글-comments)
10. [좋아요 (Likes)](#10-좋아요-likes)
11. [미션 (Missions)](#11-미션-missions)
12. [도시 (Cities)](#12-도시-cities)
13. [배지 (Badges)](#13-배지-badges)
14. [에러 코드](#14-에러-코드)

---

## 1. 공통 사항

### 요청 헤더

| 헤더 | 필수 | 설명 |
|------|------|------|
| `Authorization` | O | `Bearer {access_token}` |
| `Content-Type` | O | `application/json` |

### 공통 응답 구조

성공 응답:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true
  }
}
```

에러 응답:
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "하트가 부족합니다 (2개 필요)"
  }
}
```

### 페이지네이션 쿼리 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|----------|------|--------|------|
| `page` | integer | 1 | 페이지 번호 |
| `limit` | integer | 20 | 페이지당 항목 수 (최대 100) |

---

## 2. 인증 (Auth)

### POST `api/auth/v1/signup`

회원가입

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "김여행"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "name": "김여행",
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### POST `api/auth/v1/login`

로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### POST `api/auth/v1/refresh`

토큰 갱신

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

### POST `api/auth/v1/logout`

로그아웃. 서버 측 리프레시 토큰 무효화.

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

### POST `api/auth/v1/password/reset`

비밀번호 재설정 이메일 발송

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

### PUT `api/auth/v1/password`

비밀번호 변경 (인증 필요)

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 3. 사용자 (Users)

### GET `api/users/v1/me`

현재 로그인한 사용자의 프로필 조회. 재로그인 시 사용자의 전체 상태를 복원하는 핵심 엔드포인트.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "김여행",
    "email": "user@example.com",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "totalSteps": 523847,
    "currentCityId": "tokyo",
    "coupons": 2,
    "hearts": 5,
    "streakDays": 7,
    "friendCount": 3,
    "joinedAt": "2025-12-01T00:00:00Z"
  }
}
```

---

### PATCH `api/users/v1/me`

프로필 수정

**Request Body:**
```json
{
  "name": "새이름",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "새이름",
    "avatar": "https://cdn.example.com/new-avatar.jpg"
  }
}
```

---

### GET `api/users/v1/{userId}`

특정 사용자의 공개 프로필 조회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "박모험",
    "avatar": "",
    "totalSteps": 510000,
    "currentCityId": "tokyo",
    "isFriend": true,
    "joinedAt": "2025-11-15T00:00:00Z"
  }
}
```

---

### POST `api/users/v1/me/avatar`

아바타 이미지 업로드 (multipart/form-data)

**Request Body:**
- `file`: 이미지 파일 (JPEG, PNG, WebP / 최대 5MB)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/uuid.jpg"
  }
}
```

---

## 4. 걸음 수 (Steps)

### POST `api/steps/v1/sync`

걸음 수 동기화. 클라이언트에서 수집한 걸음 수를 서버에 전송. 서버는 누적 합산 후 도시 해금 여부 및 미션 해금 여부를 판단하여 반환.

**Request Body:**
```json
{
  "steps": 3240,
  "date": "2026-03-08",
  "source": "healthkit"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSteps": 527087,
    "todaySteps": 11487,
    "currentCityId": "tokyo",
    "previousCityId": "tokyo",
    "streakDays": 8,
    "newlyUnlockedCities": [],
    "newlyUnlockedMissions": ["t5"]
  }
}
```

---

### GET `api/steps/v1/history`

걸음 수 히스토리 조회

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `from` | string (date) | O | 시작일 (YYYY-MM-DD) |
| `to` | string (date) | O | 종료일 (YYYY-MM-DD) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      { "date": "2026-03-08", "steps": 8247 },
      { "date": "2026-03-07", "steps": 12340 }
    ],
    "totalSteps": 523847,
    "averageDaily": 9500
  }
}
```

---

## 5. 재화 (Currency)

### GET `api/currency/v1/balance`

현재 재화 잔액 조회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "coupons": 2,
    "hearts": 5,
    "weeklyCouponResetAt": "2026-03-10T00:00:00Z"
  }
}
```

---

### GET `api/currency/v1/transactions`

재화 사용/획득 이력 조회

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `type` | string | X | `coupon` 또는 `heart` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tx_uuid",
      "currencyType": "coupon",
      "amount": -1,
      "reason": "friend_add_same_city",
      "targetUserId": "user4",
      "createdAt": "2026-03-08T10:00:00Z"
    },
    {
      "id": "tx_uuid2",
      "currencyType": "coupon",
      "amount": 1,
      "reason": "weekly_reset",
      "createdAt": "2026-03-03T00:00:00Z"
    }
  ]
}
```

---

## 6. 친구 (Friends)

### GET `api/friends/v1`

친구 목록 조회

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user2",
      "name": "박모험",
      "avatar": "",
      "totalSteps": 510000,
      "currentCityId": "tokyo",
      "isOnline": true,
      "addedAt": "2026-01-15T10:00:00Z"
    }
  ]
}
```

---

### POST `api/friends/v1/request`

친구 추가 요청 (재화 차감)

**Request Body:**
```json
{
  "targetUserId": "user4",
  "method": "same_city"
}
```

| method | 비용 | 설명 |
|--------|------|------|
| `same_city` | 쿠폰 1장 | 같은 도시 사용자 |
| `other_city` | 하트 2개 | 다른 도시 사용자 |
| `qr` | 무료 | QR코드로 추가 |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "friendId": "user4",
    "method": "same_city",
    "cost": { "type": "coupon", "amount": 1 },
    "remainingBalance": { "coupons": 1, "hearts": 5 }
  }
}
```

**에러 응답 (400):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "쿠폰이 부족합니다"
  }
}
```

---

### DELETE `api/friends/v1/{friendId}`

친구 삭제

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 7. 채팅 (Chat)

1:1 친구 간 실시간 메시지 기능. 친구 관계가 성립된 사용자 간에만 채팅이 가능하다.

### GET `api/chat/v1/rooms`

채팅방 목록 조회 (친구 기반)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "room_uuid",
      "friendId": "user2",
      "friendName": "박모험",
      "friendAvatar": "",
      "friendIsOnline": true,
      "lastMessage": "도쿄타워 근처에서 만날까요? 🗼",
      "lastMessageAt": "2026-03-08T14:30:00Z",
      "unreadCount": 2
    }
  ]
}
```

---

### GET `api/chat/v1/rooms/{roomId}/messages`

채팅방 메시지 목록 조회 (페이지네이션, 최신순)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `before` | string (ISO 8601) | X | 이 시각 이전 메시지만 조회 (커서 기반) |
| `limit` | integer | X | 메시지 수 (기본 50, 최대 100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_uuid",
      "senderId": "user2",
      "content": "도쿄타워 근처에서 만날까요? 🗼",
      "read": false,
      "createdAt": "2026-03-08T14:30:00Z"
    },
    {
      "id": "msg_uuid2",
      "senderId": "user1",
      "content": "좋아요 거기서 봐요! 😊",
      "read": true,
      "createdAt": "2026-03-08T13:25:00Z"
    }
  ],
  "meta": {
    "hasMore": true,
    "oldestAt": "2026-03-08T13:00:00Z"
  }
}
```

---

### POST `api/chat/v1/rooms/{roomId}/messages`

메시지 전송

**Request Body:**
```json
{
  "content": "안녕하세요! 오늘 만날까요?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg_uuid",
    "senderId": "user1",
    "content": "안녕하세요! 오늘 만날까요?",
    "createdAt": "2026-03-08T15:00:00Z"
  }
}
```

---

### POST `api/chat/v1/rooms/{roomId}/read`

채팅방 읽음 처리 (unreadCount를 0으로 리셋)

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 8. 게시물 (Posts)

### GET `api/posts/v1`

게시물 목록 조회 (피드)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `filter` | string | X | `friends_only` (기본), `city`, `all` |
| `cityId` | string | X | `filter=city`일 때 필수 |
| `page` | integer | X | 페이지 번호 |
| `limit` | integer | X | 페이지당 항목 수 |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "post_uuid",
      "userId": "user2",
      "userName": "박모험",
      "userAvatar": "",
      "cityId": "tokyo",
      "content": "도쿄에 도착했어요!",
      "image": {
        "url": "https://cdn.example.com/posts/uuid/original.jpg",
        "thumbnailUrl": "https://cdn.example.com/posts/uuid/thumb_400.jpg",
        "width": 1920,
        "height": 1080,
        "size": 245000
      },
      "likesCount": 24,
      "commentsCount": 5,
      "isLiked": true,
      "createdAt": "2026-03-08T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "hasNext": true
  }
}
```

`image` 필드는 이미지가 없는 게시물의 경우 `null`이다.
```

---

### POST `api/posts/v1`

게시물 작성 (이미지 첨부 포함)

이미지를 첨부하는 경우 반드시 `multipart/form-data`로 전송한다.
이미지 없이 텍스트만 작성하는 경우 `application/json`으로 전송할 수 있다.

**Content-Type: `multipart/form-data`**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `content` | string | O | 게시물 본문 (최대 500자) |
| `cityId` | string | O | 작성 시점의 도시 ID |
| `image` | file | X | 첨부 이미지 (JPEG, PNG, WebP, GIF / 최대 10MB) |

**Content-Type: `application/json` (이미지 없는 경우)**

```json
{
  "content": "여행 이야기를 공유합니다",
  "cityId": "tokyo"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "post_uuid",
    "userId": "user1",
    "userName": "김여행",
    "userAvatar": "",
    "cityId": "tokyo",
    "content": "여행 이야기를 공유합니다",
    "image": {
      "url": "https://cdn.example.com/posts/uuid/original.jpg",
      "thumbnailUrl": "https://cdn.example.com/posts/uuid/thumb_400.jpg",
      "width": 1920,
      "height": 1080,
      "size": 245000
    },
    "likesCount": 0,
    "commentsCount": 0,
    "isLiked": false,
    "createdAt": "2026-03-08T15:00:00Z"
  }
}
```

이미지가 없는 경우 `image` 필드는 `null`로 반환된다.

**에러 응답 (413):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "이미지 파일 크기는 10MB를 초과할 수 없습니다"
  }
}
```

**에러 응답 (415):**
```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "지원하지 않는 파일 형식입니다. JPEG, PNG, WebP, GIF만 허용됩니다"
  }
}
```
```

---

### GET `api/posts/v1/{postId}`

게시물 단건 조회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "post_uuid",
    "userId": "user2",
    "userName": "박모험",
    "userAvatar": "",
    "cityId": "tokyo",
    "content": "도쿄에 도착했어요!",
    "image": null,
    "likesCount": 24,
    "commentsCount": 5,
    "isLiked": true,
    "createdAt": "2026-03-08T10:30:00Z"
  }
}
```

---

### DELETE `api/posts/v1/{postId}`

게시물 삭제 (본인 작성물만)

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

### GET `api/posts/v1/me`

내 게시물 목록 조회

**Response (200):** 게시물 목록과 동일한 구조

---

## 8. 댓글 (Comments)

### GET `api/posts/v1/{postId}/comments`

게시물의 댓글 목록 조회

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "comment_uuid",
      "postId": "post_uuid",
      "userId": "user3",
      "userName": "이탐험",
      "userAvatar": "",
      "content": "시부야 진짜 대단하네요!",
      "createdAt": "2026-03-08T11:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "hasNext": false
  }
}
```

---

### POST `api/posts/v1/{postId}/comments`

댓글 작성

**Request Body:**
```json
{
  "content": "정말 멋지네요!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "comment_uuid",
    "postId": "post_uuid",
    "userId": "user1",
    "userName": "김여행",
    "content": "정말 멋지네요!",
    "createdAt": "2026-03-08T15:30:00Z"
  }
}
```

---

### DELETE `api/posts/v1/{postId}/comments/{commentId}`

댓글 삭제 (본인 작성물만)

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 9. 좋아요 (Likes)

### POST `api/posts/v1/{postId}/likes`

좋아요 토글 (좋아요가 없으면 추가, 있으면 제거)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likesCount": 25
  }
}
```

---

## 10. 미션 (Missions)

### GET `api/missions/v1`

사용자의 전체 미션 목록 조회 (도시별 그룹핑)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `cityId` | string | X | 특정 도시 미션만 필터링 |
| `status` | string | X | `locked`, `available`, `completed` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokyo": [
      {
        "id": "t1",
        "cityId": "tokyo",
        "type": "photo",
        "title": "도쿄타워 앞에서 사진 찍기",
        "description": "도쿄의 상징 앞에서 여행 인증샷을 남겨보세요",
        "image": "https://cdn.example.com/missions/tokyo-tower.jpg",
        "stepsRequired": 0,
        "reward": "도쿄 탐험가",
        "status": "completed",
        "completedAt": "2026-03-05T14:00:00Z",
        "aiComposite": false,
        "aiPrompt": null
      },
      {
        "id": "t9",
        "cityId": "tokyo",
        "type": "photo",
        "title": "벚꽃 아래 인생샷 합성",
        "description": "만개한 벚꽃 터널 속 나의 모습을 AI로 합성해보세요",
        "image": "https://cdn.example.com/missions/sakura.jpg",
        "stepsRequired": 40000,
        "reward": "벚꽃 여행자",
        "status": "available",
        "completedAt": null,
        "aiComposite": true,
        "aiPrompt": "도쿄 메구로강 만개한 벚꽃 터널 아래 봄날의 풍경"
      }
    ]
  }
}
```

---

### POST `api/missions/v1/{missionId}/complete`

미션 완료 인증 제출. 미션 타입에 따라 필요한 데이터가 다름.

**Request Body (multipart/form-data):**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `image` | file | 미션 타입에 따라 | photo, food, explore 미션 시 필수 |
| `text` | string | 미션 타입에 따라 | writing 미션 시 필수 |
| `autoPost` | boolean | X | 피드에 자동 게시 여부 (기본 true) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "missionId": "t3",
    "status": "completed",
    "completedAt": "2026-03-08T16:00:00Z",
    "reward": null,
    "autoPostedId": "post_uuid_or_null"
  }
}
```

**에러 응답 (400):**
```json
{
  "success": false,
  "error": {
    "code": "MISSION_LOCKED",
    "message": "아직 해금되지 않은 미션입니다"
  }
}
```

---

### POST `api/missions/v1/{missionId}/composite`

AI 사진 합성 요청. `aiComposite: true`인 미션에서만 사용 가능.
사용자가 업로드한 사진과 미션에 정의된 배경 프롬프트를 기반으로 합성 이미지를 생성한다.

**Request Body (multipart/form-data):**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `image` | file | O | 합성할 사용자 사진 (최대 10MB, jpg/png/webp) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "missionId": "t9",
    "compositeImage": {
      "url": "https://cdn.example.com/composite/abc123.jpg",
      "thumbnailUrl": "https://cdn.example.com/composite/abc123_thumb.jpg",
      "width": 1024,
      "height": 1024,
      "prompt": "도쿄 메구로강 만개한 벚꽃 터널 아래 봄날의 풍경"
    },
    "expiresAt": "2026-03-08T17:00:00Z"
  }
}
```

서버는 합성 결과를 임시 저장하며, 미션 완료(`POST /complete`) 시 해당 이미지를 영구 저장한다.
`expiresAt` 이후 미사용 합성 이미지는 자동 삭제된다.

**에러 응답:**

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | `NOT_AI_MISSION` | AI 합성 대상이 아닌 미션 |
| 400 | `MISSION_LOCKED` | 미해금 미션 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 초과 (최대 10MB) |
| 415 | `UNSUPPORTED_FILE_TYPE` | 지원하지 않는 형식 (jpg/png/webp만 허용) |
| 503 | `AI_SERVICE_UNAVAILABLE` | AI 서비스 일시 장애 |

---

### GET `api/missions/v1/stats`

미션 통계 조회 (도시별 진행률)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCompleted": 12,
    "totalMissions": 38,
    "cities": {
      "seoul": { "completed": 5, "total": 5 },
      "busan": { "completed": 4, "total": 4 },
      "tokyo": { "completed": 2, "total": 8 }
    }
  }
}
```

---

## 11. 도시 (Cities)

### GET `api/cities/v1`

전체 도시 목록 조회 (노선도 데이터)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "seoul",
      "name": "서울",
      "country": "대한민국",
      "countryFlag": "KR",
      "stepsRequired": 0,
      "lat": 37.5665,
      "lng": 126.978,
      "description": "한류의 중심지, 전통과 현대가 공존하는 도시",
      "famousFood": ["비빔밥", "김치찌개", "떡볶이", "삼겹살"],
      "landmarks": ["경복궁", "남산타워", "명동", "홍대"],
      "isUnlocked": true
    }
  ]
}
```

---

### GET `api/cities/v1/{cityId}`

특정 도시 상세 정보 조회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "tokyo",
    "name": "도쿄",
    "country": "일본",
    "countryFlag": "JP",
    "stepsRequired": 400000,
    "lat": 35.6762,
    "lng": 139.6503,
    "description": "전통과 미래가 만나는 세계 최대 도시",
    "famousFood": ["라멘", "스시", "타코야키", "텐푸라"],
    "landmarks": ["도쿄타워", "시부야 교차로", "아사쿠사", "아키하바라"],
    "isUnlocked": true,
    "onlineUsers": 4
  }
}
```

---

### GET `api/cities/v1/{cityId}/members`

도시에 체류 중인 사용자 목록 (도시 커뮤니티)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user2",
      "name": "박모험",
      "avatar": "",
      "totalSteps": 510000,
      "isFriend": true,
      "isOnline": true
    }
  ]
}
```

---

## 12. 배지 (Badges)

배지는 미션 완료 시 reward가 있는 미션에서 자동으로 획득된다.

### GET `api/badges/v1`

사용자의 전체 배지 목록 조회 (획득 + 미획득 모두 포함)

**Query Parameters:**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `cityId` | string | X | 특정 도시 배지만 필터링 |
| `earned` | boolean | X | true: 획득한 것만, false: 미획득만 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarned": 8,
    "totalPossible": 42,
    "badges": [
      {
        "id": "badge_s1",
        "missionId": "s1",
        "cityId": "seoul",
        "cityName": "서울",
        "countryFlag": "KR",
        "title": "여행자 배지",
        "emoji": "📸",
        "description": "경복궁 앞에서 사진 찍기 미션 완료",
        "earned": true,
        "earnedAt": "2026-02-15T10:00:00Z"
      },
      {
        "id": "badge_ny4",
        "missionId": "ny4",
        "cityId": "newyork",
        "cityName": "뉴욕",
        "countryFlag": "US",
        "title": "빅 애플 러버",
        "emoji": "📸",
        "description": "타임스 스퀘어 합성샷 미션 완료",
        "earned": false,
        "earnedAt": null
      }
    ]
  }
}
```

---

### GET `api/badges/v1/stats`

배지 통계 조회 (도시별 획득률)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalEarned": 8,
    "totalPossible": 42,
    "cities": {
      "seoul": { "earned": 3, "total": 4 },
      "busan": { "earned": 2, "total": 3 },
      "tokyo": { "earned": 1, "total": 4 }
    }
  }
}
```

---

### GET `api/posts/v1/{postId}`

게시물 상세 조회 (댓글 포함)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "post_uuid",
    "userId": "user2",
    "userName": "박모험",
    "userAvatarUrl": "",
    "cityId": "tokyo",
    "content": "도쿄에 도착했어요!",
    "image": {
      "url": "https://cdn.example.com/uploads/photo.jpg",
      "thumbnailUrl": "https://cdn.example.com/uploads/photo_thumb.jpg",
      "width": 1200,
      "height": 800,
      "size": 524288
    },
    "likes": 24,
    "comments": 5,
    "isLiked": true,
    "createdAt": "2026-03-08T10:30:00Z",
    "recentComments": [
      {
        "id": "comment_uuid",
        "userId": "user3",
        "userName": "이탐험",
        "userAvatarUrl": "",
        "content": "시부야 진짜 대단하네요!",
        "createdAt": "2026-03-08T11:00:00Z"
      }
    ]
  }
}
```

---

## 14. 에러 코드

| HTTP 상태 | 에러 코드 | 설명 |
|-----------|-----------|------|
| 400 | `INVALID_REQUEST` | 요청 형식 오류 |
| 400 | `INSUFFICIENT_BALANCE` | 재화(쿠폰/하트) 부족 |
| 400 | `MISSION_LOCKED` | 미해금 미션 접근 |
| 400 | `ALREADY_COMPLETED` | 이미 완료된 미션 |
| 400 | `ALREADY_FRIENDS` | 이미 친구 관계 |
| 400 | `SELF_FRIEND_REQUEST` | 자기 자신에게 친구 요청 |
| 401 | `UNAUTHORIZED` | 인증 토큰 없음 또는 만료 |
| 413 | `FILE_TOO_LARGE` | 파일 크기 초과 (이미지 최대 10MB) |
| 415 | `UNSUPPORTED_FILE_TYPE` | 지원하지 않는 파일 형식 |
| 403 | `FORBIDDEN` | 권한 없음 (타인 게시물 삭제 등) |
| 404 | `NOT_FOUND` | 리소스 없음 |
| 409 | `CONFLICT` | 중복 요청 |
| 429 | `RATE_LIMITED` | 요청 횟수 초과 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 |

---

## 부록: 서버 관리 상태 요약

재로그인 시 클라이언트가 복원해야 하는 상태와 해당 엔드포인트:

| 상태 | 엔드포인트 | 설명 |
|------|-----------|------|
| 사용자 프로필 + 재화 | `GET /users/v1/me` | 이름, 아바타, 걸음 수, 쿠폰, 하트, 연속일 |
| 친구 목록 | `GET /friends/v1` | 친구 관계 |
| 채팅방 목록 | `GET /chat/v1/rooms` | 1:1 채팅방 + 읽지 않은 메시지 수 |
| 미션 진행 상태 | `GET /missions/v1` | 도시별 미션 잠금/완료 상태 |
| 배지 컬렉션 | `GET /badges/v1` | 획득한 배지 목록 |
| 게시물 | `GET /posts/v1` | 피드 데이터 |
| 도시 해금 상태 | `GET /cities/v1` | 걸음 수 기반 해금 여부 (서버 계산) |

클라이언트 초기화 시퀀스:
1. `POST /auth/v1/login` 또는 `POST /auth/v1/refresh` 로 토큰 획득
2. `GET /users/v1/me` 로 사용자 상태 복원
3. `GET /missions/v1` 로 미션 상태 복원
4. `GET /badges/v1` 로 배지 상태 복원
5. `GET /friends/v1` 로 친구 목록 복원
6. `GET /chat/v1/rooms` 로 채팅방 목록 복원
7. `GET /posts/v1?filter=city&cityId={currentCityId}` 로 도시 게시물 로드
