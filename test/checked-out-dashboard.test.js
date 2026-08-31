import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('대시보드 API가 기존 출고 차량을 별도 목록으로 반환한다',()=>{
  assert.match(api,/checked_out_at IS NOT NULL ORDER BY checked_out_at DESC LIMIT 200/);
  assert.match(api,/spots,unassigned,checkedOut/);
  assert.match(main,/state\.checkedOut=\(data\.checkedOut\|\|\[\]\)\.map\(mapCheckedOut\)/);
});

test('출고 차량 행은 빨간 취소선과 활성 드래그 핸들을 표시한다',()=>{
  assert.match(main,/class=\"board-row \$\{checkedOut\?'is-checked-out':''\}\"/);
  assert.match(main,/board-checkout-label\">출고/);
  assert.match(main,/handle=`<button type=\"button\" class=\"board-drag-handle\" data-board-drag[^>]*>⠿<\/button>`/);
  assert.match(main,/querySelectorAll\('\[data-board-search\]'\)/);
  assert.match(css,/\.board-row\.is-checked-out::after\{[^}]*background:#d22f2f/);
  assert.match(css,/\.board-row\.is-checked-out \.board-drag-handle\{[^}]*color:#9e2929/);
});

test('현황판 드래그 이벤트와 담당자 조작 이벤트를 계속 연결한다',()=>{
  assert.match(main,/const handle=row\.querySelector\('\[data-board-drag\]'\);if\(!handle\)return;handle\.addEventListener/);
  assert.ok(main.indexOf('bindDashboardDragAndDrop();')<main.indexOf("document.querySelectorAll('[data-manager-filter]')"));
});

test('출고 차량도 담당자 목록 순서를 D1에 저장한다',()=>{
  const reorderStart=api.indexOf("parts.join('/')==='vehicles/reorder'");
  const reorderEnd=api.indexOf("parts.join('/')==='vehicles/check-in'",reorderStart);
  const reorderHandler=api.slice(reorderStart,reorderEnd);
  assert.doesNotMatch(reorderHandler,/checked_out_at IS NULL/);
  assert.match(reorderHandler,/UPDATE vehicles SET board_order=\? WHERE id=\? AND manager=\?/);
});

test('출고 차량을 임시 주차면에 배정하고 출고 번호 요약을 표시한다',()=>{
  assert.match(api,/parts\[2\]==='assign-checked-out'/);
  assert.match(api,/출고 후 임시 주차/);
  assert.match(main,/function renderCheckedOutSummary\(\)/);
  assert.match(main,/<strong>출고됨 :<\/strong>/);
  assert.match(css,/\.checked-out-summary\{/);
});

test('출고됨 요약에는 실제 주차면에 남아 있는 출고 차량만 표시한다',()=>{
  assert.match(main,/const parked=state\.spots\.filter\(spot=>used\(spot\)&&spot\.isCheckedOut&&!spot\.isUnassigned\)/);
  assert.match(main,/parked\.length\?parked\.map\(vehicle=>/);
  assert.doesNotMatch(main,/state\.checkedOut\.length\?state\.checkedOut\.map\(vehicle=>/);
});
