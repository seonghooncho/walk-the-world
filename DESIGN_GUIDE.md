# 🗺️ WalkWorld — 컴포넌트 & 디자인 가이드

> 걷기 기반 가상 여행 소셜 앱의 UI/UX 시스템 문서

---

## 1. 디자인 철학

| 항목 | 설명 |
|------|------|
| **톤** | 여행 저널 감성 — 앰버·골드·네이비 팔레트 |
| **타이포** | Display: **Outfit** / Body: **Space Grotesk** |
| **모션** | `framer-motion` 기반, 부드러운 spring 애니메이션 |
| **레이아웃** | 모바일 퍼스트 (max-width 480px), 카드 기반 UI |

---

## 2. 컬러 토큰 (CSS Variables)

모든 색상은 HSL 포맷으로 `src/index.css`의 `:root`에서 정의하고, `tailwind.config.ts`에서 Tailwind 클래스로 매핑합니다.  
**⚠️ 컴포넌트에서 raw 색상값(bg-black, text-white 등)을 직접 사용하지 마세요.**

### 기본 토큰

| 토큰 | Light | 용도 |
|------|-------|------|
| `--background` | `220 20% 97%` | 페이지 배경 |
| `--foreground` | `222 30% 12%` | 본문 텍스트 |
| `--card` / `--card-foreground` | `0 0% 100%` | 카드 배경/텍스트 |
| `--primary` / `--primary-foreground` | `32 95% 52%` | 주요 액션 (앰버) |
| `--secondary` | `220 25% 14%` | 보조 (네이비) |
| `--muted` / `--muted-foreground` | `220 15% 92%` | 비활성 영역 |
| `--accent` | `12 76% 56%` | 강조 (오렌지-레드) |
| `--destructive` | `0 84% 60%` | 경고/삭제 |

### 커스텀 토큰

| 토큰 | 값 | 용도 |
|------|---|------|
| `--city-teal` | `174 60% 45%` | 도시 커뮤니티 |
| `--gold` | `42 90% 55%` | 보상/배지 |
| `--ocean` | `210 70% 50%` | 바다/탐험 테마 |
| `--earth` | `25 40% 40%` | 맛집/음식 테마 |
| `--success` | `152 60% 42%` | 완료 상태 |

### 그라디언트

| 유틸리티 클래스 | 용도 |
|----------------|------|
| `.bg-gradient-hero` | 주요 CTA, 프라이머리 버튼 |
| `.bg-gradient-ocean` | 도시 커뮤니티, 탐험 미션 |
| `.bg-gradient-earth` | 맛집, 음식 미션 |
| `.bg-gradient-night` | 어두운 배경, 프로필 헤더 |

### 그림자

| 유틸리티 | 용도 |
|---------|------|
| `.shadow-card` | 일반 카드 |
| `.shadow-elevated` | 호버/포커스 카드 |
| `.shadow-glow` | 주요 CTA 글로우 효과 |

### 유리 효과

```css
.glass  /* 반투명 배경 + blur — BottomNav에 사용 */
```

---

## 3. 컴포넌트 인벤토리

### 3.1 레이아웃

| 컴포넌트 | 파일 | 설명 |
|----------|------|------|
| `AppLayout` | `layout/AppLayout.tsx` | 페이지 래퍼 (max-w-lg + pb-20 for nav) |
| `BottomNav` | `layout/BottomNav.tsx` | 5탭 하단 네비게이션 (홈/지도/도시/채팅/프로필) |

### 3.2 공유 컴포넌트

| 컴포넌트 | 파일 | 재사용 위치 | Props |
|----------|------|------------|-------|
| **BottomSheet** | `shared/BottomSheet.tsx` | CommentSheet, CreatePostSheet, ProfileSheets | `open, onClose, title?, className?, children` |
| **UserAvatar** | `shared/UserAvatar.tsx` | PostCard, CommentSheet, CityPage, ProfilePage, ChatRoomPage | `name, avatar?, size(sm\|md\|lg), showOnline?` |
| **ProfileDetailSheet** | `shared/ProfileDetailSheet.tsx` | CityPage 멤버, FeedPage 채팅목록, ChatRoomPage | `user, onClose, onAddFriend?` |
| **ImageUpload** | `shared/ImageUpload.tsx` | CreatePostSheet, MissionDetailModal | `image, onImageChange, label?, compact?` |
| **LoadingSpinner** | `shared/LoadingSpinner.tsx` | FriendAddModal, MissionDetailModal | `size?` |
| **StepProgressRing** | `shared/StepProgressRing.tsx` | HomePage, ProfilePage | `progress(0-100), size?, strokeWidth?, children` |
| **FriendCouponBadge** | `shared/FriendCouponBadge.tsx` | HomePage | `count` |
| **PostCard** | `shared/PostCard.tsx` | CityPage (게시물 탭), PostDetailPage | `post` (전체 클릭→상세 이동) |
| **MissionCard** | `shared/MissionCard.tsx` | HomePage, CityCard (MapPage) | `mission, index?, onClick?` |
| **TravelSpotCard** | `shared/TravelSpotCard.tsx` | SpotCarousel | `name, image, subtitle?, index?` |
| **SpotCarousel** | `shared/SpotCarousel.tsx` | HomePage | `title, emoji, items[], maxVisible?` |
| **CityCard** | `shared/CityCard.tsx` | MapPage | `city, isUnlocked, isCurrent, index, defaultExpanded?, onMissionClick?` |

### 3.3 모달 / 시트

| 컴포넌트 | 파일 | 트리거 |
|----------|------|--------|
| **CommentSheet** | `shared/CommentSheet.tsx` | PostDetailPage 댓글 영역 |
| **CreatePostSheet** | `shared/CreatePostSheet.tsx` | CityPage 작성 버튼 |
| **MissionDetailModal** | `shared/MissionDetailModal.tsx` | MissionCard 클릭 |
| **FriendAddModal** | `shared/FriendAddModal.tsx` | CityPage 친추 버튼, ProfileDetailSheet |
| **ProfileDetailSheet** | `shared/ProfileDetailSheet.tsx` | CityPage 멤버 아바타, FeedPage 아바타, ChatRoomPage 헤더 |
| **SettingsSheet** | `shared/ProfileSheets.tsx` | ProfilePage 설정 |
| **MyPostsSheet** | `shared/ProfileSheets.tsx` | ProfilePage 내 게시물 |

---

## 4. 유틸리티 & 훅

| 모듈 | 파일 | 설명 |
|------|------|------|
| `getTimeAgo()` | `lib/timeAgo.ts` | 상대 시간 포맷 (방금 전, n분 전, n시간 전...) |
| `cn()` | `lib/utils.ts` | Tailwind 클래스 병합 (clsx + tailwind-merge) |
| `useAppStore` | `stores/appStore.ts` | Zustand 전역 상태 (유저, 게시물, 미션, 재화) |
| `useMobile()` | `hooks/use-mobile.tsx` | 모바일 뷰포트 감지 |

---

## 5. 상태 관리 (Zustand)

> ⚠️ 현재 Zustand 스토어는 mock 데이터로 초기화되며, 백엔드 API 연동 시 로그인 후 서버 데이터로 교체해야 합니다.

```
useAppStore
├── user: UserProfile              ← GET /users/v1/me 로 복원
├── coupons: number                ← GET /users/v1/me 또는 /currency/v1/balance
├── hearts: number                 ← 위와 동일
├── userMap: Record<id, UserProfile> ← 사용자 룩업 (중복 생성 방지)
├── posts: Post[]                  ← GET /posts/v1?filter=city&cityId=...
├── comments: Comment[]            ← GET /posts/v1/{postId}/comments
├── chatRooms: ChatRoom[]          ← GET /chat/v1/rooms (메시지 포함)
├── missions: Record<cityId, Mission[]>  ← GET /missions/v1
│
├── addPost(content, image?, cityId?)
├── toggleLike(postId)
├── addComment(postId, content)
├── getPostComments(postId) → Comment[]
├── addFriend(userId, sameCityCost) → {success, message}
├── addFriendFree(userId) → {success, message}
├── getChatRoomByFriendId(friendId) → ChatRoom?
├── sendMessage(chatId, content)
├── completeMission(missionId, cityId)
└── getMission(missionId, cityId) → Mission?
```

### 백엔드 의존 데이터 맵

| 데이터 | 현재 소스 | 백엔드 엔드포인트 | 비고 |
|--------|----------|------------------|------|
| 사용자 프로필 | `mockData.currentUser` → store | `GET /users/v1/me` | 로그인 시 복원 |
| 사용자 룩업 | store.userMap (빌드 시 생성) | `GET /users/v1/{id}` | 캐시 역할 |
| 도시 멤버 목록 | `mockData.cityUsers` 하드코딩 | `GET /cities/v1/{cityId}/members` | API 연동 필요 |
| 게시물 | `mockData.posts` → store | `GET /posts/v1` | API 연동 필요 |
| 채팅방·메시지 | store.chatRooms (중앙화 완료) | `GET /chat/v1/rooms`, `/messages` | API 연동 필요 |
| 미션 | `missionData.cityMissions` → store | `GET /missions/v1` | API 연동 필요 |
| 오늘 걸음수 | `user.todaySteps` (store) | `GET /steps/v1/history` | API 연동 필요 |
| 도시 마스터 | `mockData.cities` 하드코딩 | `GET /cities/v1` | 정적 or API |


---

## 6. 페이지 구조

| 경로 | 페이지 | 핵심 기능 |
|------|--------|----------|
| `/` | HomePage | 걸음 현황, 미션, 명소/맛집 카루셀 |
| `/map` | MapPage | 전체 도시 노선도 + 미션 확장 |
| `/city` | CityPage | 도시 커뮤니티 (게시물/멤버 탭, 기본: 게시물) |
| `/feed` | FeedPage | 1:1 채팅방 목록 (친구 기반) |
| `/chat/:chatId` | ChatRoomPage | 1:1 채팅 상세 (메시지 말풍선, 전송, 프로필) |
| `/post/:postId` | PostDetailPage | 게시물 상세 + 댓글 |
| `/profile` | ProfilePage | 통계, 방문 도시, 설정 |
| `/profile/badges` | BadgeCollectionPage | 배지 컬렉션 |
| `/add-friend/:userId` | AddFriendPage | QR 친구 추가 |

---

## 7. 모션 패턴

| 패턴 | 설정 | 사용처 |
|------|------|--------|
| **Spring sheet** | `damping: 28, stiffness: 300` | 모든 BottomSheet/Modal |
| **Fade-up** | `opacity: 0→1, y: 20→0` | 카드 진입 애니메이션 |
| **Stagger** | `delay: index * 0.05~0.1` | 리스트 아이템 순차 등장 |
| **Pulse glow** | `pulse-glow 2s infinite` | 활성 미션 인디케이터 |
| **Walk bounce** | `walk 0.6s infinite` | 현재 도시 핀 아이콘 |
| **Layout ID** | `layoutId="nav-indicator"` | 탭 인디케이터 전환 |
| **Tap scale** | `whileTap={{ scale: 1.3 }}` | 좋아요 하트 |

---

## 8. 재사용 규칙

1. **BottomSheet**: 하단에서 올라오는 UI는 반드시 `BottomSheet` 래퍼 사용
2. **ImageUpload**: 이미지 업로드 필요 시 `ImageUpload` 컴포넌트 사용 (`compact` prop으로 인라인 모드)
3. **LoadingSpinner**: 비동기 버튼의 로딩 상태에 `LoadingSpinner` 사용
4. **getTimeAgo**: 시간 포맷은 `lib/timeAgo.ts`에서 import
5. **UserAvatar**: 사용자 아바타 표시 시 항상 `UserAvatar` 사용 (initials fallback 내장)
6. **ProfileDetailSheet**: 다른 사용자 프로필 조회 시 `ProfileDetailSheet` 사용 (바텀시트 형태)
7. **색상**: `bg-primary`, `text-muted-foreground` 등 시맨틱 토큰만 사용. raw HSL 금지
8. **Store 우선**: 모든 페이지에서 사용자 데이터는 `useAppStore`의 `user`를 사용. `currentUser` 직접 import 금지

---

## 9. 파일 구조

### 프론트엔드
```
src/
├── assets/              # 이미지 에셋
├── components/
│   ├── layout/          # AppLayout, BottomNav
│   ├── shared/          # 재사용 컴포넌트 (위 표 참조)
│   └── ui/              # shadcn/ui 기본 컴포넌트
├── data/                # 목 데이터 (mockData, missionData, spotImages)
├── hooks/               # 커스텀 훅
├── lib/                 # 유틸리티 (utils, timeAgo)
├── pages/               # 라우트 페이지 컴포넌트
└── stores/              # Zustand 스토어
```

### 백엔드 (Spring Boot)
```
backend/src/main/java/com/walkworld/api/
├── WalkWorldApplication.java     # 엔트리포인트 (@EnableJpaAuditing)
├── LambdaHandler.java            # AWS Lambda 어댑터
├── global/                       # 횡단 관심사 (Cross-cutting)
│   ├── config/                   # SecurityConfig, S3Config, CorsConfig, JwtProperties, WebConfig
│   ├── entity/                   # BaseTimeEntity (JPA Auditing 베이스)
│   ├── error/                    # BaseErrorCode, CustomException, GeneralErrorCode, GlobalExceptionHandler
│   ├── health/                   # HealthCheckController
│   ├── response/                 # ApiResponse (공통 응답)
│   └── validator/                # ValidPassword, PasswordValidator
└── domain/                       # 비즈니스 도메인
    ├── auth/                     # 인증 (회원가입/로그인/토큰)
    │   ├── controller/           # AuthController
    │   ├── dto/req/              # SignupReqDTO, LoginReqDTO, RefreshReqDTO
    │   ├── dto/res/              # TokenResDTO
    │   ├── entity/               # RefreshToken
    │   ├── error/                # AuthErrorCode, AuthException
    │   ├── jwt/                  # JwtProvider, JwtAuthenticationFilter
    │   ├── repository/           # RefreshTokenRepository
    │   └── service/              # AuthService, AuthServiceImpl
    ├── user/                     # 사용자 프로필 & 걸음 수
    │   ├── controller/           # UserController, StepController
    │   ├── converter/            # UserConverter
    │   ├── dto/                  # UserProfileResponse, UpdateProfileRequest, StepSyncRequest/Response
    │   ├── entity/               # User (extends BaseTimeEntity)
    │   ├── error/                # UserErrorCode, UserException
    │   ├── repository/           # UserRepository
    │   └── service/              # UserService, StepService + Impls
    ├── post/                     # 게시물/댓글/좋아요
    │   ├── controller/           # PostController
    │   ├── converter/            # PostConverter
    │   ├── dto/                  # PostResponse, CommentResponse, CreatePostRequest, ...
    │   ├── entity/               # Post (extends BaseTimeEntity), Comment, Like
    │   ├── error/                # PostErrorCode, PostException
    │   ├── repository/           # PostRepository, CommentRepository, LikeRepository
    │   └── service/              # PostService, PostServiceImpl
    ├── mission/                  # 미션
    │   ├── controller/           # MissionController
    │   ├── converter/            # MissionConverter
    │   ├── dto/                  # MissionResponse, MissionCompleteRequest/Response, ...
    │   ├── entity/               # Mission, UserMission
    │   ├── error/                # MissionErrorCode, MissionException
    │   ├── repository/           # MissionRepository, UserMissionRepository
    │   └── service/              # MissionService, MissionServiceImpl
    ├── friend/                   # 친구
    │   ├── controller/           # FriendController
    │   ├── converter/            # FriendConverter
    │   ├── dto/                  # FriendResponse, AddFriendRequest
    │   ├── entity/               # Friendship
    │   ├── error/                # FriendErrorCode, FriendException
    │   ├── repository/           # FriendshipRepository
    │   └── service/              # FriendService, FriendServiceImpl
    ├── city/                     # 도시
    │   ├── controller/           # CityController
    │   ├── dto/                  # CityResponse, CityMemberResponse
    │   ├── entity/               # City
    │   ├── repository/           # CityRepository
    │   └── service/              # CityService, CityServiceImpl
    ├── badge/                    # 배지
    │   ├── controller/           # BadgeController
    │   ├── dto/                  # BadgeResponse, BadgeListResponse, BadgeStatsResponse
    │   ├── entity/               # UserBadge
    │   ├── repository/           # UserBadgeRepository
    │   └── service/              # BadgeService, BadgeServiceImpl
    ├── currency/                 # 재화 (쿠폰/하트)
    │   ├── controller/           # CurrencyController
    │   ├── dto/                  # CurrencyResponse
    │   ├── entity/               # UserCurrency, CurrencyTransaction
    │   ├── error/                # CurrencyErrorCode, CurrencyException
    │   ├── repository/           # UserCurrencyRepository, CurrencyTransactionRepository
    │   └── service/              # CurrencyService, CurrencyServiceImpl
    └── s3/                       # 파일 업로드
        ├── controller/           # S3Controller
        ├── enums/                # FileDomain
        ├── error/                # S3ErrorCode, S3Exception
        └── service/              # S3Service
```

### 인프라 (Terraform)
```
infra/
├── main.tf              # Provider, backend 설정
├── variables.tf         # 변수 정의
├── outputs.tf           # 출력값
├── vpc.tf               # VPC 네트워크
├── database.tf          # RDS (MySQL)
├── lambda.tf            # Lambda 함수
├── api-gateway.tf       # API Gateway
└── s3-cloudfront.tf     # 프론트엔드 호스팅
```

---

## 10. 백엔드 설계 패턴

### 에러 처리 패턴
- **`BaseErrorCode` 인터페이스**: 모든 도메인 ErrorCode enum이 구현
- **`CustomException`**: BaseErrorCode를 받아 생성, GlobalExceptionHandler에서 일괄 처리
- **도메인별 ErrorCode**: `AuthErrorCode`, `PostErrorCode` 등 — 타입 안전한 에러 코드 관리
- **도메인별 Exception**: `AuthException`, `PostException` 등 — 명확한 예외 추적

### Converter 패턴
- Entity → DTO 변환 로직을 **Converter** 클래스에 분리
- Service는 비즈니스 로직에만 집중, 매핑 책임은 Converter에 위임
- `@NoArgsConstructor(access = PRIVATE)` + static 메서드 방식

### JPA Auditing
- `BaseTimeEntity`를 상속하여 `createdAt`, `updatedAt` 자동 관리
- `@EnableJpaAuditing` 활성화됨

### 설정 관리
- `JwtProperties` (@ConfigurationProperties) — 타입 안전한 JWT 설정
- 프로파일 분리: `local` / `prod`

