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

test('출고 차량 행은 수정·순서 변경 없이 빨간 취소선으로 표시한다',()=>{
  assert.match(main,/class=\"board-row \$\{checkedOut\?'is-checked-out':''\}\"/);
  assert.match(main,/board-checkout-label\">출고/);
  assert.match(main,/class=\"board-drag-handle is-disabled\" disabled[^>]*>⠿<\/button>/);
  assert.match(main,/querySelectorAll\('\[data-board-search\]:not\(\.is-checked-out\)'\)/);
  assert.match(css,/\.board-row\.is-checked-out::after\{[^}]*background:#d22f2f/);
  assert.match(css,/\.board-drag-handle\.is-disabled\{[^}]*opacity:1/);
});

test('출고 차량의 비활성 핸들이 있어도 현황판 조작 이벤트를 계속 연결한다',()=>{
  assert.match(main,/const handle=row\.querySelector\('\[data-board-drag\]'\);if\(!handle\)return;handle\.addEventListener/);
  assert.ok(main.indexOf('bindDashboardDragAndDrop();')<main.indexOf("document.querySelectorAll('[data-manager-filter]')"));
});

test('출고 차량을 임시 주차면에 배정하고 출고 번호 요약을 표시한다',()=>{
  assert.match(api,/parts\[2\]==='assign-checked-out'/);
  assert.match(api,/출고 후 임시 주차/);
  assert.match(main,/function renderCheckedOutSummary\(\)/);
  assert.match(main,/<strong>출고됨 :<\/strong>/);
  assert.match(css,/\.checked-out-summary\{/);
});
