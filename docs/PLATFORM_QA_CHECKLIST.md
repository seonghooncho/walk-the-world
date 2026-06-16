## 근본 목적
웹, Android, iOS에서 로그인, 권한, 만보기, 딥링크가 실제 사용자 여정대로 이어지는지 점검해 출시 전 핵심 기능 신뢰도를 높인다.

## 비목적
만보기나 소셜 로그인처럼 플랫폼 의존성이 큰 흐름을 실행하지 않은 채 문서상 완료 처리하는 것은 목적이 아니다.

# Walk2World Platform QA Checklist

## 웹
- [x] 공개 홈 화면 진입 확인
- [x] 보호 화면 접근 시 로그인 요구 확인
- [x] Kakao OAuth 시작 URL이 공식 `kauth.kakao.com`으로 이동하는지 확인
- [x] 웹 origin 기준 state 생성 확인
- [ ] 실제 Kakao 로그인 후 `/auth/callback` 복귀와 토큰 저장 확인
- [ ] 실제 Google 로그인 후 토큰 저장과 메인 복귀 확인
- [ ] 프로필/채팅/도시 화면의 로그인 후 진입 확인
- [ ] 미션 도전, 커뮤니티, 친구 추가 등 보호 액션 확인

## Android
- [x] `make mobile-check`
- [x] `npx expo export --platform android`
- [x] `ACTIVITY_RECOGNITION` 권한 선언 확인
- [x] 만보기 날짜 키를 로컬 날짜 기준으로 수정
- [x] Kakao OAuth start URL의 모바일 origin state 생성 확인
- [ ] 실제 Android 기기에서 활동 인식 권한 허용 확인
- [ ] 실제 걸음 수 증가 후 `/api/steps/v1/sync` 반영 확인
- [ ] 앱 백그라운드 복귀 후 걸음 수 재동기화 확인
- [ ] Kakao 로그인 후 앱 복귀 확인
- [ ] Google 로그인 후 앱 복귀 확인

## iOS
- [x] iOS export 번들 생성 확인
- [x] `NSMotionUsageDescription` 선언 확인
- [ ] 실제 iPhone 또는 시뮬레이터에서 앱 실행 확인
- [ ] 모션/피트니스 권한 허용 확인
- [ ] 실제 걸음 수 증가 후 진행도 반영 확인
- [ ] Kakao 로그인 후 앱 복귀 확인
- [ ] Google 로그인 후 앱 복귀 확인

## 사용자 개입 필요 절차
1. Android 실기기 연결 후 활동 인식 권한 허용
2. iPhone 또는 시뮬레이터 실행 환경 준비
3. Google/Kakao 실제 계정 로그인 승인
4. 일정 시간 걷기 후 홈/프로필의 걸음 수와 진행도 변화를 확인
