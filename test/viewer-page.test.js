import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
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

test('/view는 통계와 상품화·계약 출고 목록 및 모든 펼치기 버튼을 숨긴다',()=>{
  assert.match(main,/document\.querySelector\('\.parking-summary'\)\?\.remove\(\)/);
  assert.match(main,/document\.querySelector\('\.legend'\)\?\.remove\(\)/);
  assert.match(main,/\.map-head-toggle,\.parking-alert-icons,\.parking-option-indicator/);
  assert.doesNotMatch(main,/document\.querySelector\('\[data-toggle-map="tower"\]'\)\?\.addEventListener\('click'/);
  assert.doesNotMatch(main,/renderViewerWorkspace\(\);renderCheckedOutSummary\(\);renderParkingSearchResults\(\)/);
});

test('/view 새싹타워는 B5 아래에서 12행씩 좌우로 나눠 표시한다',()=>{
  assert.match(main,/viewerTower=VIEWER_MODE&&zone\.id==='tower'/);
  assert.match(main,/expanded:viewerTower\|\|state\.expandedLayouts\.has\(zone\.id\),splitAfterRow:viewerTower\?12:0/);
  assert.match(css,/\.viewer-page \.zones\.is-all>\.parking-map\[data-map-zone="tower"\]\{grid-column:1\/-1;grid-row:4\}/);
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

test('/view 검색은 차량번호와 차종만 대상으로 한다',()=>{
  assert.match(main,/parkingSearchValues=s=>VIEWER_MODE\?\[s\.plate,s\.model\]:\[s\.plate,s\.model,s\.color,s\.manager,s\.label,s\.zone,s\.memo\]/);
  assert.match(main,/!q\|\|parkingSearchValues\(s\)\.some\(v=>String\(v\)\.toLowerCase\(\)\.includes\(q\)\)/);
  assert.match(main,/used\(s\)&&parkingSearchValues\(s\)\.some\(value=>String\(value\)\.toLowerCase\(\)\.includes\(query\)\)/);
  assert.match(main,/searchControl\(VIEWER_MODE\?'차량번호 · 차종 검색':'차량번호 · 차종 · 색상 · 담당자 검색'\)/);
});
