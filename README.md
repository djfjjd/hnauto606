# 하나 파킹 리뉴얼

중고차 매매 주차장의 차량 위치, 빈 자리, 점검 필요 상태를 빠르게 확인하고 수정하는 정적 웹 앱입니다. 별도 서버 없이 실행되며 변경 데이터는 브라우저 `localStorage`에 저장됩니다.

## MacBook에서 실행

Node.js 20 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다. 배포용 결과는 `npm run build` 후 `dist/`에 생성됩니다.

## GitHub 저장소로 올리기

```bash
git init
git add .
git commit -m "feat: renew Hana Parking dashboard"
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

`OWNER/REPOSITORY`는 새 GitHub 저장소 주소로 바꿉니다. `.env`나 비밀키는 커밋하지 않습니다.

## Cloudflare Pages 배포와 도메인 연결

1. Cloudflare 대시보드의 **Workers & Pages → Create → Pages → Connect to Git**에서 GitHub 저장소를 연결합니다.
2. 빌드 명령은 `npm run build`, 출력 디렉터리는 `dist`로 설정합니다.
3. 배포가 끝나면 Pages 프로젝트의 **Custom domains → Set up a custom domain**에서 사용할 도메인 또는 `parking.example.com` 같은 서브도메인을 추가합니다.
4. 도메인이 이미 Cloudflare DNS를 사용하면 필요한 DNS 레코드가 자동 생성됩니다. 다른 DNS를 사용한다면 안내된 CNAME 레코드를 등록합니다.
5. 프로덕션 배포 확인 후 Lovable 주소의 방문자를 새 도메인으로 유도합니다.

## 운영 데이터 이전 전 확인

현재 구현은 화면과 사용자 흐름을 검증하기 위한 1차 버전입니다. 여러 직원이 같은 데이터를 공유하려면 Cloudflare D1 또는 기존 Supabase 데이터베이스를 연결해야 합니다. 운영 전에는 기존 Lovable 프로젝트에서 테이블 구조와 데이터 백업을 확보하고, 로그인·권한·변경 이력·자동 백업 정책을 확정하세요.

## 권장 이전 순서

1. 현행 데이터를 CSV/SQL로 백업하고 차량·주차면·상태 필드를 매핑합니다.
2. 스테이징 도메인에서 기능·모바일·인쇄 테스트를 완료합니다.
3. 운영 중 입력을 잠시 중지하고 최종 데이터를 이전합니다.
4. 새 사이트를 읽기 전용으로 먼저 공개해 수량과 위치를 대조합니다.
5. 이상이 없으면 쓰기 기능을 열고 주 도메인을 전환합니다.
