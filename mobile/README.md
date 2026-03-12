# 걸어서 세계속으로 모바일

`mobile/`은 웹 서비스와 동일한 디자인 언어와 서버 API를 사용하는 Expo + React Native 앱이다.

## 실행

```sh
npm install
npx expo start
```

또는 루트에서:

```sh
make mobile-install
make mobile-env-ssm ENV=prod
make mobile-dev
```

## 검증

```sh
make mobile-check
```

## 환경변수

필수:

```text
EXPO_PUBLIC_API_BASE_URL
```

선택:

```text
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
```

권장 기본값:

```text
EXPO_PUBLIC_API_BASE_URL=https://walk2world.cloud
```

카카오 로그인은 백엔드 `/api/auth/v1/oauth/kakao/start` 경로를 사용하며, 모바일 스킴 콜백은 `walkworld:///auth/callback` 기준이다.
Google 로그인은 웹 client id 외에 iOS/Android client id를 같이 넣는 구성이 안전하다.
iOS client id가 비어 있으면 iOS 앱에서는 Google 버튼을 비활성 안내 상태로 보여준다. 현재 운영 기준으로는 Apple Developer 팀이 없어 iOS Google은 아직 미구성 상태다.
