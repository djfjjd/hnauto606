import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('담당자별 전체·출고됨·판매중 필터를 펼치기 왼쪽에 표시한다',()=>{
  assert.match(main,/class="manager-header-actions"><div class="manager-status-filter"/);
  assert.match(main,/data-manager-status="all"[^>]*>전체<\/button><button[^>]*data-manager-status="checked-out"[^>]*>출고됨<\/button><button[^>]*data-manager-status="active"[^>]*>판매중<\/button><\/div><button[^>]*class="manager-expand-toggle"/);
  assert.match(css,/\.manager-header-actions\{display:flex;align-items:center;gap:18px\}/);
});

test('각 담당자의 상태 필터를 독립 저장하고 검색·페이지 처리와 함께 적용한다',()=>{
  assert.match(main,/managerStatusFilters:\{\}/);
  assert.match(main,/status=state\.managerStatusFilters\[manager\]\|\|'all'/);
  assert.match(main,/status==='checked-out'&&row\.classList\.contains\('is-checked-out'\)/);
  assert.match(main,/status==='active'&&!row\.classList\.contains\('is-checked-out'\)/);
  assert.match(main,/state\.managerPages\[manager\]=1;updateDashboardGroup\(group,state\.query\)/);
});
