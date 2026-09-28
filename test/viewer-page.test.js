import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const parkingMap=readFileSync(new URL('../src/parking-map.js',import.meta.url),'utf8');
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
  assert.match(main,/expanded:viewerTower\|\|state\.expandedLayouts\.has\(zone\.id\),splitAfterRow:viewerTower\?12:0,splitSecondColumns:viewerTower\?8:0/);
  assert.match(main,/firstSideFacilityLabel:viewerTower\?'B5층':'',secondSideFacilityLabel:viewerTower\?'B6층':''/);
  assert.match(css,/\.viewer-page \.zones\.is-all>\.parking-map\[data-map-zone="tower"\]\{grid-column:1\/-1;grid-row:4\}/);
  assert.match(css,/\.viewer-page \.parking-map\[data-map-zone="tower"\] \.parking-map-scroll\{overflow-x:hidden;padding-right:0;padding-left:0\}/);
  assert.match(css,/\.viewer-page \.parking-map\[data-map-zone="tower"\] \.parking-map-grid\{width:100%;grid-template-columns:repeat\(var\(--map-columns\),minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.viewer-page \.parking-map\[data-map-zone="tower"\] \.parking-special\.type-facility strong\{font-size:36px\}/);
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

test('/view 검색은 차량번호만 대상으로 한다',()=>{
  assert.match(main,/parkingSearchValues=s=>VIEWER_MODE\?\[s\.plate\]:\[s\.plate,s\.model,s\.color,s\.manager,s\.label,s\.zone,s\.memo\]/);
  assert.match(main,/matchesSearchTerms\(parkingSearchValues\(s\),state\.query\)/);
  assert.match(main,/used\(s\)&&matchesSearchTerms\(parkingSearchValues\(s\),query\)/);
  assert.match(main,/VIEWER_MODE\?'차량번호 뒤 4자리 · 콤마로 여러 대 검색':placeholder/);
});

test('/view는 차량번호 뒤 4자리가 완성된 검색 결과의 주차구역만 표시한다',()=>{
  assert.match(main,/if\(VIEWER_MODE\)return terms\.length>0&&terms\.every\(term=>\/\^\\d\{4\}\$\/\.test\(term\)\)&&terms\.some/);
  assert.match(main,/function restrictViewerParkingZones\(\)/);
  assert.match(main,/allTab\.disabled=true/);
  assert.match(main,/zoneIds\.has\(mapZone\)/);
  assert.match(main,/차량번호 뒤 4자리를 입력해 주세요/);
});

test('/view는 콤마로 여러 차량을 검색하고 결과 외 차량을 빈자리 칸으로 감춘다',()=>{
  assert.match(main,/matchIds=new Set\(matches\.map\(spot=>String\(spot\.id\)\)\)/);
  assert.match(main,/parking-cell\.is-occupied\[data-spot\]/);
  assert.match(main,/cell\.className='parking-cell is-vacant viewer-hidden-vehicle'/);
  assert.match(main,/cell\.innerHTML=number/);
  assert.doesNotMatch(main,/viewer-hidden-vehicle';cell\.innerHTML=`\$\{number\}<strong/);
  assert.match(main,/cell\.removeAttribute\('data-spot'\)/);
});

test('/view는 검색상자 아래 주차구역 필터 행을 숨긴다',()=>{
  assert.match(css,/\.viewer-page \.zone-tabs,\.viewer-page \.workspace>\.no-result\{display:none\}/);
});

test('/view는 공통 검색 실패 및 필터 초기화 레이아웃을 숨긴다',()=>{
  assert.match(css,/\.viewer-page \.workspace>\.no-result\{display:none\}/);
});

test('/view 모바일 새싹타워 차량번호는 좁은 칸에 맞게 작게 표시한다',()=>{
  assert.match(css,/@media\(max-width:800px\)\{\.viewer-page \.parking-map\[data-map-zone="tower"\] \.parking-cell\.is-occupied\{padding-inline:0\}\.viewer-page \.parking-map\[data-map-zone="tower"\] \.parking-cell\.is-occupied strong\{font-size:11px!important;letter-spacing:-\.08em;white-space:nowrap\}\}/);
});

test('/view 새싹타워 B5 M열과 B6 A열 사이에 빨간 경계선을 표시한다',()=>{
  assert.match(main,/splitAfterRow:viewerTower\?12:0,splitSecondColumns:viewerTower\?8:0/);
  assert.match(parkingMap,/options\.zoneId==='tower'&&sideBySide[^\n]*class="tower-floor-divider"/);
  assert.match(css,/\.tower-floor-divider\{[^}]*border-left:3px solid #d92323/);
});
