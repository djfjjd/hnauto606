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
  assert.match(main,/querySelectorAll\('\[data-board-search\]:not\(\.is-checked-out\)'\)/);
  assert.match(css,/\.board-row\.is-checked-out::after\{[^}]*background:#d22f2f/);
});
