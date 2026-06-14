# 경계 요구사항

## 근본 목적

회원탈퇴 복구, 입력 길이, 권한 경계, 재진입처럼 정상 흐름과 오류 흐름 사이에 있는 조건을 한 기준으로 고정해 사용자 차단과 데이터 노출 오류를 줄인다.

## 비목적

모바일 구현, 운영 물리 삭제 배치, 관리자 복구 도구, 법무 보존 정책 전체 설계는 이번 문서의 범위에 포함하지 않는다.

## 공통 기준

| 영역 | 경계 조건 | 허용/차단 기준 | API 응답 | 웹 UX | 자동화 테스트 |
|------|-----------|----------------|----------|-------|---------------|
| 텍스트 입력 | 공백-only | trim 결과가 빈 값이면 차단 | `400 INVALID_REQUEST` | 전송 버튼 비활성화 | Playwright, controller validation |
| 텍스트 입력 | 500자 | 허용하고 trim 후 저장 | `200/201` | 카운터 `500/500` | Playwright, controller validation |
| 텍스트 입력 | 501자 이상 | 차단 | `400 INVALID_REQUEST` | `maxLength=500`으로 입력 차단 | Playwright, controller validation |
| 페이지네이션 | `limit < 1` | `1`로 보정 | meta limit `1` | 추가 UI 없음 | controller test |
| 페이지네이션 | `limit > 100` | `100`으로 보정 | meta limit `100` | 추가 UI 없음 | controller test |

## 인증/계정

| 영역 | 경계 조건 | 허용/차단 기준 | API 응답 | 웹 UX | 자동화 테스트 |
|------|-----------|----------------|----------|-------|---------------|
| 회원탈퇴 | active 사용자가 탈퇴 | `withdrawn` 상태와 `withdrawnAt` 저장, refresh token 삭제 | `200` | 토큰 삭제 후 로그인 화면 이동 | Playwright, service test |
| 탈퇴 복구 | 탈퇴 후 30일 이내 동일 인증 로그인 | 계정을 `active`로 복구하고 `withdrawnAt` 삭제 | token payload `restored=true` | 복구 완료 toast 후 redirect 복귀 | Playwright, service test |
| 탈퇴 만료 | 탈퇴 후 30일 초과 로그인 | 복구 차단 | `410 ACCOUNT_WITHDRAWN_EXPIRED` | 오류 toast | service test |
| 기존 토큰 | 탈퇴 후 남은 access token | 인증 주체로 인정하지 않음 | `401` | 로그인 만료 처리 | filter/service test |

## 채팅

| 영역 | 경계 조건 | 허용/차단 기준 | API 응답 | 웹 UX | 자동화 테스트 |
|------|-----------|----------------|----------|-------|---------------|
| 방 참여자 | `roomId`는 존재하지만 요청자가 참여자가 아님 | 메시지 조회/전송/읽음 모두 차단 | `403 CHAT403` | 채팅방 없음/복구 UI | service test |
| 메시지 재진입 | 전송 후 나갔다가 같은 방 재진입 | 서버 재조회 결과에 방금 메시지 유지 | `200` | 스레드에 메시지 유지 | Playwright |
| 탈퇴한 상대 | 상대가 탈퇴 상태 | 방과 메시지는 보존, 이름/아바타 비공개 | `friendName=탈퇴한 사용자` | 프로필 이미지 미노출 | service test |

## 게시글/댓글/친구

| 영역 | 경계 조건 | 허용/차단 기준 | API 응답 | 웹 UX | 자동화 테스트 |
|------|-----------|----------------|----------|-------|---------------|
| 게시글/댓글 | 탈퇴 작성자 | 게시물과 댓글은 보존, 작성자 이름/아바타 비공개 | `userName=탈퇴한 사용자` | 기존 콘텐츠 유지 | service test |
| 친구 추가 | 자기 자신 | 차단 | `400 SELF_FRIEND_REQUEST` | 오류 toast | service test |
| 친구 추가 | 이미 친구 | 차단 | `400 ALREADY_FRIENDS` | 오류 toast | service test |
| 친구 추가 | 알 수 없는 method | 차단 | `400 INVALID_FRIEND_METHOD` | 오류 toast | service test |
| 친구 추가 | 재화 부족 | 차단 | currency error | 오류 toast | service test |

## 걸음 수

| 영역 | 경계 조건 | 허용/차단 기준 | API 응답 | 웹 UX | 자동화 테스트 |
|------|-----------|----------------|----------|-------|---------------|
| 걸음 동기화 | `steps = 0` | 허용 | 현재 첫 도시 기준 진행률 | 시작 상태 표시 | service/controller test |
| 걸음 동기화 | 음수 steps | 차단 | `400 INVALID_REQUEST` | 오류 toast | controller validation |
| 도시 해금 | 도시 요구 걸음 수와 정확히 같음 | 해당 도시 해금 | `newlyUnlockedCities` 포함 | 해금 표시 | service test |
