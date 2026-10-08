import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('담당자별 전체·판매중·출고됨·저번달 필터를 펼치기 왼쪽에 표시한다',()=>{
  assert.match(main,/class="manager-header-actions"><div class="manager-status-filter"/);
  assert.match(main,/filter\.replaceChildren\(all,active,checkedOut,previous\)/);
  assert.match(main,/previous\.dataset\.managerStatus='previous-month'/);
  assert.match(main,/previous\.textContent='저번달'/);
  assert.match(css,/\.manager-header-actions\{display:flex;align-items:center;gap:18px\}/);
});

test('각 담당자의 상태 필터를 독립 저장하고 검색·페이지 처리와 함께 적용한다',()=>{
  assert.match(main,/managerStatusFilters:\{\}/);
  assert.match(main,/status=state\.managerStatusFilters\[manager\]\|\|'all'/);
  assert.match(main,/const checkedOut=row\.classList\.contains\('is-checked-out'\),closed=checkedOut\|\|row\.classList\.contains\('is-contracted'\)/);
  assert.match(main,/status==='all'&&!\(checkedOut&&previousMonth\)/);
  assert.match(main,/status==='checked-out'&&closed/);
  assert.match(main,/status==='active'&&!closed/);
  assert.match(main,/status==='previous-month'&&checkedOut&&previousMonth/);
  assert.match(main,/data-board-previous-month="\$\{previousMonth\}"/);
  assert.match(main,/s\.isContracted\?'is-contracted':''/);
  assert.match(main,/data-board-sequence="\$\{sequence\}"/);
  assert.match(main,/editableMatches=matches\.filter\(row=>row\.dataset\.boardPinned!=='true'\)/);
  assert.match(main,/cell\.textContent=row\.dataset\.boardPinned==='true'\?'0':String\(editableMatches\.indexOf\(row\)\+1\)/);
  assert.match(main,/state\.managerPages\[manager\]=1;updateDashboardGroup\(group,state\.query\)/);
});

test('저번달 필터는 직전 달 출고 차량만 표시하고 전체에서는 제외한다',()=>{
  assert.match(main,/dashboardMonthWindow=\(today=new Date\(\)\)=>\(\{previousStart:dashboardDateKey\(new Date\(today\.getFullYear\(\),today\.getMonth\(\)-1,1\)\),currentStart:dashboardDateKey\(new Date\(today\.getFullYear\(\),today\.getMonth\(\),1\)\)\}\)/);
  assert.match(main,/isVisibleBoardHistory=vehicle=>\{if\(!isClosedBoardVehicle\(vehicle\)\)return true;.*return Boolean\(date&&date>=previousStart\)/);
  assert.match(main,/isPreviousMonthBoardVehicle=vehicle=>\{if\(!vehicle\.isCheckedOut\)return false;const date=String\(vehicle\.checkedOutAt\|\|''\)\.slice\(0,10\),.*date>=previousStart&&date<currentStart/);
  assert.match(main,/boardVehicles\(\)\.filter\(isVisibleBoardHistory\)\.reduce/);
});

test('현황판 상단 차량 대수는 출고 차량을 제외한다',()=>{
  assert.match(main,/vehicles=boardVehicles\(\)\.filter\(vehicle=>!vehicle\.isCheckedOut\)/);
  assert.match(main,/<strong>\$\{vehicles\.length\}<small>대<\/small><\/strong>/);
});
