# (주)하나오토 차량·주차 관리

(주)하나오토 중고차 매매 현장의 입차, 위치 이동, 차량 상태, 서비스 작업, 출차와 이력을 관리하는 반응형 웹 앱입니다.

현재 배포는 **운영 D1 마이그레이션 적용 전 읽기 전용 데모 모드**입니다. 데모 데이터는 운영 데이터가 아니며 저장되지 않습니다. D1 바인딩과 Cloudflare Access가 설정된 뒤에만 변경 버튼이 활성화됩니다.

## 구조와 선택 이유

```text
Vite 정적 UI → Cloudflare Pages → Pages Functions API → Cloudflare D1
                                                     ↘ 비공개 R2(선택)
                                                     ↘ Web Push 발송기
```

기존 프로젝트가 Vite 정적 사이트이며 이미 Cloudflare Pages와 GitHub에 연결되어 있어 Pages + Pages Functions를 유지했습니다. 별도 Worker 프로젝트 없이 같은 도메인에서 UI와 API를 운영할 수 있어 CORS와 배포 구성이 단순합니다. D1은 운영 데이터의 기준 저장소이며 브라우저 저장소는 사용하지 않습니다.

R2는 차량 사진·성능점검표·문서 업로드가 실제로 필요한 시점에만 활성화합니다. 버킷은 비공개로 두고 Pages Function이 권한을 확인한 뒤 객체를 처리하며 D1에는 파일 메타데이터만 저장합니다.

## 구현 범위

- 주차 통계, 구역 배치, 검색, 상태·구역 필터, 모바일/인쇄 UI
- 신규 입차, 정보 수정, 위치·서비스 구역 이동, 출차
- 차량번호·현재 위치 중복 방지와 버전 기반 충돌 감지
- 입차·이동·서비스·출차 전체 이력과 감사 로그
- 차량 상태 및 중요 알림 이벤트 저장
- 푸시 구독·해제와 사용자별 알림 설정 API, PWA manifest, 서비스 워커
- 사진·문서용 비공개 R2 메타데이터 테이블(버킷은 아직 미사용)
- 로딩·저장 중·완료·오류·빈 결과·읽기 전용 데모 상태

## 데이터베이스

`migrations/0001_initial.sql`은 다음 테이블과 검색 인덱스를 생성합니다.

`users`, `vehicles`, `parking_zones`, `parking_spots`, `parking_movements`, `vehicle_status`, `service_records`, `vehicle_files`, `push_subscriptions`, `notification_preferences`, `audit_logs`, `notification_events`

초기 구역과 116개 주차면도 같은 마이그레이션에 포함됩니다. 운영 적용 전 실제 구역·주차면과 대조하고 기존 데이터 백업 및 매핑을 완료해야 합니다. 운영 D1에는 사용자 확인 없이 마이그레이션을 적용하지 않습니다.

## 로그인과 권한

기존 인증 시스템이 없어 취약한 자체 로그인을 만들지 않았습니다. 운영 방식은 **Cloudflare Access**를 권장합니다. Access가 전달한 이메일을 서버에서 `users` 테이블과 대조하며 모든 API가 역할을 다시 확인합니다.

우측 상단 톱니바퀴는 `/admin`으로 연결됩니다. Cloudflare Zero Trust에서 `hnauto606.pages.dev`를 Self-hosted 애플리케이션으로 보호하고 One-time PIN을 로그인 방식으로 지정합니다. 첫 번째로 인증된 실제 이메일은 D1 `users`에 관리자로 자동 등록되며, 초기 데이터 가져오기용 `.invalid` 시스템 사용자는 이 계산에서 제외됩니다. OTP 정책은 임의 이메일 전체가 아니라 허용할 이메일 주소 또는 회사 이메일 도메인으로 제한해야 합니다.

- `admin`: 모든 데이터와 사용자 관리
- `staff`: 입차·수정·이동·상태·출차
- `viewer`: 조회 전용

로컬 통합 테스트에서만 `ALLOW_DEMO_AUTH=true`와 `X-Demo-User` 헤더를 사용할 수 있습니다. 운영에서는 반드시 `false`로 유지합니다.

## 설치와 검증

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
git diff --check
```

Node.js 20 또는 22 LTS를 권장합니다. 빌드 결과는 `dist/`입니다.

마이그레이션을 로컬 SQLite에서 검증하려면 다음을 사용합니다.

```bash
sqlite3 /tmp/hnauto-test.sqlite < migrations/0001_initial.sql
```

## Cloudflare 설정

1. 운영·미리보기 D1 데이터베이스를 각각 생성합니다.
2. `wrangler.toml`의 두 D1 ID 자리표시자를 실제 ID로 교체합니다.
3. 운영 적용 승인을 받은 뒤 먼저 미리보기 D1에 마이그레이션을 적용합니다.
4. Cloudflare Access 애플리케이션과 허용 사용자를 설정하고 `users`에 관리자부터 등록합니다.
5. `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`를 Pages 환경 변수/Secret에 설정합니다. 비밀키는 저장소에 넣지 않습니다.
6. 실제 사진·문서 기능을 열 때만 비공개 R2 버킷을 생성하고 `FILES` 바인딩을 활성화합니다.

Pages 설정은 운영 브랜치 `main`, 빌드 명령 `npm run build`, 출력 폴더 `dist`입니다. `public/_redirects`가 SPA 경로 새로고침을 지원합니다.

## API

구현됨: dashboard, zones, spots, vehicles 목록·상세·이력, check-in, update, move/service, check-out, status, push subscribe/unsubscribe, notification preferences. 입력 검증과 401/403/404/409/500 오류 응답을 포함합니다.

푸시 구독과 알림 이벤트 저장은 구현되어 있습니다. 실제 Web Push 발송은 VAPID Secret 설정 후 발송 Worker 또는 Queue 소비자를 연결해야 합니다. 위치 저장은 알림 이벤트와 분리되어 알림 전송 실패가 차량 변경을 되돌리지 않습니다.

## 운영 전 필수 확인

- 기존 데이터 백업, 필드 매핑, 중복 차량·잘못된 위치 검사
- 실제 구역·주차면 수와 초기 데이터 대조
- 미리보기 D1에서 통계·입차·이동·서비스·출차·이력 비교
- Cloudflare Access 정책과 관리자/직원/조회 권한 검증
- VAPID Secret 및 푸시 발송기 연결, 실패 구독 정리·재시도 검증
- 실제 390px 모바일, 데스크톱, 인쇄, 여러 브라우저 동시성 테스트
- 사용자 지정 도메인, HTTPS, 대표 도메인과 `www` 리디렉션 확정
