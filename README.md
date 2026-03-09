# Walk the World

## 근본 목적

- 프론트엔드, 백엔드, 인프라의 책임 경계를 디렉터리 수준에서 명확히 나눠 변경 영향 범위를 빠르게 파악할 수 있게 한다.
- 각 영역의 진입점과 실행 위치를 일관되게 정리해 유지보수와 리뷰 동선을 단순화한다.

## 비목적

- 이번 정리는 새로운 모노레포 도구를 도입하거나 전체 실행 방식을 재설계하는 작업이 아니다.
- 기능 추가나 화면 개편은 이번 범위에 포함하지 않는다.

## 저장소 구조

- `fe/`: React, Vite, Tailwind 기반 프론트엔드 앱과 관련 설정
- `fe/src/mocks`: 데모/목 데이터
- `fe/src/lib/api`, `fe/src/hooks/api`: API 클라이언트와 React Query 훅
- `backend/`: Spring Boot 기반 API 서버
- `infra/`: 재사용 가능한 Terraform 베이스 모듈
- `infra/env/dev`, `infra/env/prod`: 환경별 Terraform 진입점
- `bin/`: 보조 스크립트
- `DESIGN_GUIDE.md`: 프론트엔드 UI/UX 시스템 가이드
- `API_SPEC.md`: 백엔드 API 명세

## 공통 작업 진입점

루트 `Makefile`로 영역별 실행 동선을 통일한다.

```sh
make fe-check
make be-test
make infra-validate-dev
```

## 프론트엔드 작업

프론트엔드 코드는 모두 `fe/` 아래에서 관리한다.

```sh
make fe-install
make fe-dev
```

검증 명령:

```sh
make fe-check
```

## 백엔드 작업

백엔드는 도메인 패키지를 유지하되, 단일 구현만 존재하는 서비스는 concrete service 클래스로 관리한다.

```sh
make be-test
make be-zip
```

프로필 설정은 아래 파일로 분리되어 있다.

```text
backend/src/main/resources/application.yml
backend/src/main/resources/application-local.yml
backend/src/main/resources/application-prod.yml
```

## 인프라 작업

Terraform은 루트 `infra/`를 베이스 모듈로 두고, 실제 실행은 `infra/env/*`에서 수행한다.

```sh
make infra-fmt
make infra-validate-dev
make infra-validate-prod
```

## 협업 기준

- 프론트엔드 변경은 기본적으로 `fe/` 안에서 끝나도록 유지한다.
- 백엔드는 도메인 경계를 유지하되, 인터페이스/구현체 1:1 분리는 남용하지 않는다.
- 서버 상태는 React Query, UI/임시 상태는 Zustand로 분리한다.
- 인프라 변경은 `infra/env/*` 기준으로 검증하고 환경별 상태 파일을 분리한다.
- 구조 변경 시 README와 관련 가이드 문서의 경로 설명을 함께 갱신한다.
- 루트 디렉터리에서는 제품 영역 경계가 한눈에 보이도록 유지한다.
