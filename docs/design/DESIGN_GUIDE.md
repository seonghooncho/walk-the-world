# walk2world 웹 디자인 가이드

## 근본 목적

여행 진행감 중심의 화면을 일관된 토큰과 컴포넌트로 구현해, UI 변경 시 겹침·가독성·상태 표현 오류를 줄이는 것이 목적이다.

## 비목적

모든 화면의 픽셀 결과를 고정하거나, 컴포넌트 내부 구현을 문서에 그대로 복제하는 것은 목적이 아니다.

## 디자인 방향

- 톤: 밝은 neutral 배경, ocean teal 주요 액션, coral accent, gold reward.
- 폰트: 기본 한글은 `Noto Sans KR`, 숫자와 걸음 수는 `Outfit` 기반 `font-num`.
- 첫 화면 기준: 랜딩 설명보다 현재 도시와 다음 목표를 바로 보여준다.
- 카드: 개별 정보 묶음에만 사용하고, 페이지 섹션 전체를 중첩 카드처럼 만들지 않는다.

## 레이어와 safe-area

- 하단 내비게이션 높이는 `--app-bottom-nav-height`로 관리한다.
- 내비게이션이 있는 페이지 본문은 `app-content-with-nav`를 사용한다.
- 바텀시트는 `app-bottom-sheet-root`, `app-bottom-sheet-panel`, `app-layer-modal`을 함께 사용한다.
- 임의 `z-50`, `z-[100]` 추가보다 `app-layer-*` 유틸을 우선한다.

## 공통 컴포넌트

- `AppLayout`: 모바일 폭 제한, 하단 nav 포함 여부, safe-area 본문 여백을 관리한다.
- `PageHeader`: sticky 상단 헤더와 뒤로가기/우측 액션을 표준화한다.
- `EmptyState`: 빈 목록, 검색 결과 없음, 아직 시작하지 않은 기능의 복구 행동을 보여준다.
- `ProtectedRoute`: 로그인 필요 화면의 redirect를 통일한다.

## 화면별 기준

- Home: hero 이미지는 실제 도시 이미지를 사용하고, 다음 도시까지 남은 걸음을 첫 카드에 표시한다.
- Map: 도시 카드 목록보다 현재 체크포인트 요약이 먼저 보인다.
- City: 게시물과 멤버 탭은 유지하되, 빈 게시물 상태에는 작성 CTA가 있어야 한다.
- Feed: 채팅방 없음 상태는 도시 커뮤니티 진입 CTA를 제공한다.
- Profile: 설정 버튼은 sticky header에 두고 QR 액션은 프로필 요약 아래에 둔다.
