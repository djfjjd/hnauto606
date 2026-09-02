import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('상단 구글드라이브 메뉴는 내부 페이지와 외부 바로가기를 구분한다',()=>{
  assert.match(main,/class="external-menu drive-menu"/);
  assert.match(main,/data-drive-menu aria-expanded="false">구글드라이브/);
  assert.match(main,/class="external-submenu"><a href="\/drive">구글드라이브<\/a>/);
  assert.match(main,/<a href="\/drive\/heydealer">헤이딜러<\/a>/);
  assert.match(main,/drive\.google\.com\/drive\/folders\/1k4BU4_b2khbN2iY9neB43Fqms58J2GaU\?usp=drive_link" target="_blank"[^>]*>바로가기<\/a>/);
  assert.match(css,/\.external-menu:hover \.external-submenu/);
  assert.match(css,/\.external-menu:focus-within \.external-submenu/);
});

test('구글드라이브 메뉴는 모바일 클릭과 키보드 Escape 조작을 지원한다',()=>{
  assert.match(main,/driveMenu\.classList\.toggle\('is-open'\)/);
  assert.match(main,/button\.setAttribute\('aria-expanded',String\(open\)\)/);
  assert.match(main,/if\(event\.key==='Escape'\)/);
});

test('/drive 경로에 Google API 연결 전 안전한 프롬프트 화면을 제공한다',()=>{
  assert.match(main,/function renderDrivePage\(\)/);
  assert.match(main,/class="drive-prompt-panel"/);
  assert.match(main,/id="drive-prompt"[^>]*maxlength="12000"/);
  assert.match(main,/parseHeydealerText\(prompt\.value\)/);
  assert.match(main,/driveField\('manager','담당자'\)/);
  assert.match(main,/driveField\('departureTime','출발시간'\)/);
  assert.match(main,/id="drive-payment-prompt"/);
  assert.match(main,/\(탁송인수 정보\)/);
  assert.match(main,/\(차대금 입금\)/);
  assert.match(main,/mergeParsed\(parsed\)/);
  assert.match(main,/저장 내용은 이 브라우저에 보관됩니다/);
  assert.match(main,/location\.pathname==='\/drive'/);
  assert.match(css,/\.drive-prompt-panel\{/);
  assert.match(css,/\.drive-prompt-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('헤이딜러 입력은 초기화와 저장을 지원하고 목록 페이지에서 확인한다',()=>{
  assert.match(main,/data-drive-reset>초기화/);
  assert.match(main,/data-drive-save>저장/);
  assert.match(main,/saveHeydealerRecord\(/);
  assert.match(main,/location\.href='\/drive\/heydealer'/);
  assert.match(main,/function renderHeydealerRecordsPage\(\)/);
  assert.match(main,/location\.pathname==='\/drive\/heydealer'/);
  assert.match(main,/헤이딜러 저장 목록/);
  assert.match(css,/\.heydealer-record-list\{/);
});
