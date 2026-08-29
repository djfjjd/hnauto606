import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0011_add_vehicle_board_order.sql',import.meta.url),'utf8');

test('담당자별 차량을 10대씩 독립적으로 페이지 처리한다',()=>{
  assert.match(main,/const BOARD_PAGE_SIZE=10/);
  assert.match(main,/state\.managerPages\[manager\]/);
  assert.match(main,/start\+BOARD_PAGE_SIZE/);
  assert.match(css,/\.board-row\[hidden\]\{display:none!important\}/);
});

test('차량 목록에 순번과 6점 드래그 핸들을 표시하고 D1에 순서를 저장한다',()=>{
  assert.match(main,/data-board-sequence/);
  assert.match(main,/data-board-drag[^>]+[^<]*>⠿<\/button>/);
  assert.match(main,/bindDashboardDragAndDrop/);
  assert.match(main,/api\('vehicles\/reorder'/);
  assert.match(api,/parts\.join\('\/'\)==='vehicles\/reorder'/);
  assert.match(migration,/ADD COLUMN board_order INTEGER NOT NULL DEFAULT 0/);
  assert.match(css,/\.board-drag-handle\{/);
});

test('페이지 탐색에 맨처음·이전·번호·다음·맨끝을 제공한다',()=>{
  assert.match(main,/>맨처음<\/button>/);
  assert.match(main,/aria-label="이전 페이지"/);
  assert.match(main,/aria-label="다음 페이지"/);
  assert.match(main,/>맨끝<\/button>/);
  assert.match(css,/\.board-pagination\{/);
});
