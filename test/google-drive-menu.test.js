import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('상단 구글드라이브 메뉴는 내부 페이지와 외부 바로가기를 구분한다',()=>{
  assert.match(main,/class="external-menu drive-menu"/);
  assert.match(main,/data-drive-menu aria-expanded="false">구글드라이브/);
  assert.match(main,/class="external-submenu"><a href="\/drive">구글드라이브<\/a>/);
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
  assert.match(main,/Google Drive API 연결 전에는 파일을 변경하지 않습니다/);
  assert.match(main,/location\.pathname==='\/drive'/);
  assert.match(css,/\.drive-prompt-panel\{/);
});
