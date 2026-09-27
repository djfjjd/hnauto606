import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('/view는 인증 전에 공개 조회 데이터를 불러온다',()=>{
  assert.match(main,/if\(VIEWER_MODE\)\{await loadViewer\(\);return;\}/);
  assert.match(handler,/parts\.join\('\/'\)==='viewer\/dashboard'[\s\S]*?const auth=await requireUser\(request,env,method!=='GET'\)/);
});

test('/view는 검색을 제외한 주차 조작과 이동을 비활성화한다',()=>{
  assert.match(main,/removeAttribute\('draggable'\)/);
  assert.match(main,/clone\.querySelectorAll\('button,\[data-spot\]'\)/);
  assert.match(main,/if\(VIEWER_MODE\)return;panel\.querySelectorAll/);
});

test('/view는 큰 헤드라인과 사업자 푸터를 없애고 제목을 상단 바에 표시한다',()=>{
  assert.match(main,/document\.querySelector\('\.parking-title'\)\?\.remove\(\)/);
  assert.match(main,/<h1 class="viewer-page-title">주차 위치 현황<\/h1><span class="viewer-badge">외부 실사 조회 전용<\/span>/);
  assert.match(main,/document\.querySelector\('footer'\)\?\.remove\(\)/);
  assert.doesNotMatch(main,/heroButtons\?\.classList\.add\('viewer-headline-spacer'\)/);
});

test('/view는 통계와 상품화·계약 출고 목록 및 구역 펼치기를 숨긴다',()=>{
  assert.match(main,/document\.querySelector\('\.parking-summary'\)\?\.remove\(\)/);
  assert.match(main,/document\.querySelector\('\.legend'\)\?\.remove\(\)/);
  assert.match(main,/clone\.querySelectorAll\('\.map-head-toggle,\.parking-alert-icons,\.parking-option-indicator'\)\.forEach\(element=>element\.remove\(\)\)/);
  assert.doesNotMatch(main,/renderViewerWorkspace\(\);renderCheckedOutSummary\(\);renderParkingSearchResults\(\)/);
});

test('/view 주차 칸은 계약·출고 강조와 상태 문구 및 경고 아이콘을 숨긴다',()=>{
  assert.match(main,/clone\.querySelectorAll\('\.parking-cell\.is-checked-out,\.parking-cell\.is-contracted'\)/);
  assert.match(main,/cell\.classList\.remove\('is-checked-out','is-contracted'\)/);
  assert.match(main,/model\.textContent\.replace\(\/\^\\\(\(\?:계약됨\|출고됨\)\\\)\\s\*\//);
  assert.match(main,/replace\(\/ \(\?:계약됨\|출고됨\)\$\/,' 주차 중'\)/);
});

test('/view 검색은 출고 차량과 계약 상태 및 내부 관리 열을 숨긴다',()=>{
  assert.match(main,/const searchPool=VIEWER_MODE\?state\.spots\.filter\(vehicle=>!vehicle\.isCheckedOut\):/);
  assert.match(main,/\$\{!VIEWER_MODE&&s\.isContracted\?'<b>\(계약중\)<\/b>':''\}/);
  assert.match(main,/\$\{VIEWER_MODE\?'':`<span>\$\{esc\(s\.manager\)\|\|'-'\}<\/span><span class="parking-search-dates">/);
});
