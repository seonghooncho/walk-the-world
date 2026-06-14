# 웹 QA 매트릭스

## 근본 목적

인증 토큰 소실, 보호 화면 redirect, 빈 상태 누락처럼 사용자가 바로 막히는 오류를 재현 가능한 테스트와 수동 체크로 추적하는 것이 목적이다.

## 비목적

운영 Google/Kakao OAuth 전체 과정을 자동화하거나, 백엔드·DB·인프라 장애를 이 문서 하나에서 모두 검증하는 것은 목적이 아니다.

## 자동화 시나리오

| 영역 | 시나리오 | 도구 | 상태 |
|------|----------|------|------|
| Guest preview | 홈에서 도쿄 preview와 로그인 CTA 확인 후 노선도 이동 | Playwright | 자동화 |
| 보호 라우트 | `/profile` 직접 접근 시 `/login?redirect=%2Fprofile` 이동 | Playwright, Vitest | 자동화 |
| OAuth callback | hash token 저장 후 `/profile` 복귀 | Playwright, Vitest | 자동화 |
| OAuth failure | query error 수신 시 로그인 화면 복귀 | Vitest | 자동화 |
| Token refresh | 401 후 refresh 성공 시 원 요청 재시도 | Vitest | 자동화 |
| Token failure | refresh 실패 시 토큰 삭제 | Vitest | 자동화 |
| Demo | `/demo` 여정/미션/도시 탭 렌더링 | Playwright | 자동화 |
| 친구 추가 | 도시 멤버를 친구로 추가한 뒤 메시지 액션으로 전환 | Playwright | 자동화 |
| 채팅 | 채팅방에서 메시지 전송 후 스레드에 즉시 표시 | Playwright | 자동화 |
| 댓글 | 게시글 상세에서 댓글 작성 후 목록에 표시 | Playwright | 자동화 |
| 프로필 시트 | 닫힌 내 게시물 시트가 불필요한 내 게시물 조회로 프로필 렌더를 깨뜨리지 않음 | Playwright | 자동화 |

## 수동 스모크 체크

- 운영 Google 로그인: 버튼 노출, 계정 선택, 백엔드 `/api/auth/v1/google` 응답, redirect 복귀, localStorage token 유지 확인.
- 운영 Kakao 로그인: `/api/auth/v1/oauth/kakao/start` 이동, Kakao callback, `/auth/callback#accessToken=...` 복귀, redirect 복귀 확인.
- 모바일 폭: 360px, 390px, 430px에서 홈 hero, 하단 nav, 바텀시트, 프로필 QR 버튼 겹침 확인.
- API 장애: `/api/users/v1/me` 500 또는 네트워크 오류 시 토큰이 즉시 삭제되지 않는지 확인.
- QR 스캔: 실제 카메라 권한 허용/거부, 잘못된 QR, `/add-friend/:userId` 이동 확인.
- 이미지 업로드 미션/게시글: presigned URL 발급, S3 PUT, 등록 API까지 운영 환경에서 확인.
- Social 미션: 친구 0명일 때 완료 불가, 친구 추가 후 완료 가능 상태 확인.

## 현재 확인된 잔여 경고

- `npm run lint`는 shadcn/ui 계열 파일과 AuthContext의 fast-refresh 경고가 남아 있다. 빌드 실패나 런타임 오류는 아니며, 컴포넌트 export 구조를 분리하는 별도 정리 작업에서 다룬다.
- Vite build는 chunk size warning을 표시한다. 라우트 단위 code splitting은 성능 개선 작업에서 별도로 판단한다.
- Browserslist 데이터가 오래됐다는 경고가 있다. 의존성 업데이트 정책과 함께 별도 처리한다.
