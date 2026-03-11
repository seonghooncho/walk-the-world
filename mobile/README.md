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

카카오 로그인은 백엔드 `/api/auth/v1/oauth/kakao/start` 경로를 사용하며, 모바일 스킴 콜백은 `walkworld:///auth/callback` 기준이다.
