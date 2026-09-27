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

test('/view 헤드라인은 숨긴 입출고 버튼 공간을 유지해 캘린더 높이를 보존한다',()=>{
  assert.match(main,/heroButtons\?\.classList\.add\('viewer-headline-spacer'\)/);
  assert.match(main,/heroButtons\?\.setAttribute\('aria-hidden','true'\)/);
  assert.match(main,/button\.disabled=true;button\.tabIndex=-1/);
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
