import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('현황판 판매중 대수에 담당자별 차량 목록 링크를 제공한다',()=>{
  assert.match(main,/class="board-sales-count-link" href="\/dashboard\/sales"/);
  assert.match(main,/function renderDashboardSalesPage\(\)/);
  assert.match(main,/location\.pathname==='\/dashboard\/sales'/);
  assert.match(main,/class="sales-manager-group"/);
  assert.match(main,/parkingScheduleModelLabel\(vehicle\.model\)/);
});

test('판매중 차량 목록은 인쇄 버튼과 A4 인쇄 스타일을 제공한다',()=>{
  assert.match(main,/data-sales-print/);
  assert.match(main,/querySelector\('\[data-sales-print\]'\)\.onclick=\(\)=>window\.print\(\)/);
  assert.match(css,/@media print\{[^}]*@page\{size:A4 portrait;margin:12mm\}/);
  assert.match(css,/\.sales-list-topbar\{display:none\}/);
});
