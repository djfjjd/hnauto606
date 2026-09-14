import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0016_add_trusted_devices.sql',import.meta.url),'utf8');
const config=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');
const envExample=readFileSync(new URL('../.env.example',import.meta.url),'utf8');

test('인증 기기 토큰은 HttpOnly 쿠키와 D1 해시로 관리한다',()=>{
  assert.match(api,/HttpOnly; Secure; SameSite=Lax/);
  assert.match(api,/crypto\.subtle\.digest\('SHA-256'/);
  assert.match(migration,/token_hash TEXT NOT NULL UNIQUE/);
  assert.doesNotMatch(migration,/token TEXT/);
});

test('인증 기기 목록 조회와 해제 API를 제공한다',()=>{
  assert.match(api,/parts\[1\]==='devices'/);
  assert.match(api,/method==='DELETE'.*parts\[1\]==='devices'/);
  assert.match(api,/revoked_at=CURRENT_TIMESTAMP/);
  assert.match(ui,/인증 기기 관리/);
  assert.match(ui,/data-device-delete/);
});

test('익명 쓰기를 끄고 삭제된 기기의 이메일 재인증을 요구한다',()=>{
  assert.match(config,/ALLOW_ANONYMOUS_WRITES = "false"/);
  assert.match(api,/DEVICE_REAUTH_REQUIRED/);
  assert.match(api,/recentAccessAuthentication/);
  assert.match(ui,/device_reauth=1/);
});

test('운영 적용 전에는 기기 인증을 설정으로 우회한다',()=>{
  assert.match(config,/DEVICE_AUTH_ENABLED = "false"/);
  assert.match(api,/deviceAuthEnabled=env=>env\.DEVICE_AUTH_ENABLED==='true'/);
  assert.match(api,/if\(!user&&!deviceAuthEnabled\(env\)\)user=await sharedActor\(env\)/);
  assert.match(api,/authenticated:true,bypass:true/);
});

test('관리자 페이지는 ADMIN_EMAIL과 Cloudflare Access 인증을 모두 요구한다',()=>{
  assert.match(envExample,/ADMIN_EMAIL=admin@example\.com/);
  assert.match(api,/env\.ADMIN_EMAIL/);
  assert.match(api,/CF-Access-Authenticated-User-Email/);
  assert.match(api,/CF-Access-Jwt-Assertion/);
  assert.match(api,/email!==configured/);
  assert.match(api,/parts\[1\]==='admin-access'/);
  assert.match(api,/requireAdminEmail\(request,env\)/);
  assert.match(ui,/function renderAdminGate/);
  assert.match(ui,/관리자 이메일/);
  assert.match(ui,/이메일 인증번호/);
  assert.match(ui,/관리자 이메일 인증 시작/);
  assert.match(ui,/async function ensureAdminAccess\(\)/);
  assert.match(ui,/if\(adminPage\)\{if\(await ensureAdminAccess\(\)\)renderAdmin\(\);return;\}/);
});

test('인증 기기 관리 API도 관리자 이메일로만 접근한다',()=>{
  assert.match(api,/const adminRoute=parts\[1\]==='devices'/);
  assert.match(api,/if\(adminRoute\)\{const admin=requireAdminEmail\(request,env\)/);
  assert.match(api,/if\(adminRoute\)user\.role='admin'/);
});
