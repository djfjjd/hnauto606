import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('차량 선택 검색어가 비어 있으면 안내 문구와 목록을 표시하지 않는다',()=>{
  assert.doesNotMatch(main,/차량 검색어를 입력해 주세요/);
  assert.match(main,/options\.innerHTML=!query\?'':currentMatches\.length/);
});

test('출고 차량은 주차·상품화·미배정을 포함한 차량현황판 전체에서 선택한다',()=>{
  assert.match(main,/차량현황판에 등록된 차량을 계약 또는 출고 처리할 수 있습니다\./);
  assert.match(main,/checkoutPickerRoot\?createVehicleListPicker\(checkoutPickerRoot,\{vehicles:boardVehicles\(\)\.filter\(vehicle=>!vehicle\.isCheckedOut\)\.map/);
  assert.match(main,/function boardVehicles\(\)\{return\[\.\.\.new Map\(\[\.\.\.state\.spots\.filter\(used\),\.\.\.state\.checkedOut\]/);
});

test('빈 자리 배정 목록에서 미배정 차량과 아직 주차되지 않은 출고 차량을 검색한다',()=>{
  assert.match(main,/assignableVehicles=\[\.\.\.state\.unassigned,\.\.\.state\.checkedOut\.filter\(vehicle=>!vehicle\.currentSpotId\)\]/);
  assert.match(main,/vehicle\.isCheckedOut\?'assign-checked-out':'move'/);
  assert.match(main,/if\(!vehicle\.isCheckedOut\)return content;const checkedOutDate=String\(vehicle\.checkedOutAt\|\|''\)\.slice\(0,10\)\|\|'날짜 미입력'/);
  assert.match(main,/class="vehicle-list-checked-out">\$\{content\} <em>\(출고됨, \$\{esc\(checkedOutDate\)\}\)<\/em>/);
  assert.match(css,/\.vehicle-list-checked-out,\.vehicle-list-checked-out em\{color:#c82020/);
});

test('빈 자리 배정에서 추가된 일정의 미입고 차량을 검색하고 입고 후 바로 배정한다',()=>{
  assert.match(main,/scheduledVehicles=state\.calendarRecords\.filter\(record=>!record\.calendar_completed_at&&!registeredPlates\.has/);
  assert.match(main,/scheduleRecordId:record\.id,plate:record\.plate,model:record\.model\|\|''/);
  assert.match(main,/upcomingLabel:expectedDate\?`\$\{expectedDate\.slice\(5\)\.replace\('-','\/'\)\} 입고예정`:'일정 확인중'/);
  assert.match(main,/class="vehicle-list-upcoming">\(\$\{esc\(vehicle\.upcomingLabel\)\}\)<\/em>/);
  assert.match(main,/if\(vehicle\.scheduleRecordId\).*api\('vehicles\/check-in'.*api\(`vehicles\/\$\{vehicleId\}\/move`/s);
  assert.match(main,/if\(vehicle\.scheduleRecordId&&!confirm\('신규입고등록 처리 후 저장할까요\?'\)\)return/);
  assert.match(main,/rollbackCheckIn:true/);
});

test('새싹 빈자리 팝업은 실제 셀 좌표 대신 B5·B6 주차구역 번호를 표시한다',()=>{
  assert.match(main,/function modalLocationLabel\(s\)\{if\(state\.mode==='assign'&&s\.zoneId==='tower'\)return`주차구역 · \$\{towerParkingLabel\(s\.label\)\.replace\('층 ',''\)\}`/);
  assert.match(main,/<p class="eyebrow">\$\{esc\(modalLocationLabel\(s\)\)\}<\/p>/);
});

test('빈 자리 검색에서 이미 주차된 차량의 차량번호와 주차구역을 안내한다',()=>{
  assert.match(main,/parkedVehicles=state\.spots\.filter\(vehicle=>used\(vehicle\)&&!vehicle\.isUnassigned&&!vehicle\.isCheckedOut\)/);
  assert.match(main,/unavailableMessage:`\(\$\{vehicle\.plate\}\) \(\$\{vehicle\.zoneShort\|\|vehicle\.zone\} \$\{vehicle\.label\}\) 주차되어있는 차량입니다\.`/);
  assert.match(main,/class="vehicle-list-unavailable">\$\{esc\(vehicle\.unavailableMessage\)\}/);
  assert.match(main,/currentMatches\[0\]\.unavailableMessage/);
  assert.match(main,/completeLastFour=\/\^\\d\{4\}\$\/\.test\(query\)/);
  assert.match(main,/filter\(vehicle=>!vehicle\.unavailableMessage\|\|completeLastFour\)/);
});

test('빈 자리 차량 검색 결과가 한 대면 Enter로 선택하고 즉시 저장한다',()=>{
  assert.match(main,/submitSingleOnEnter=false/);
  assert.match(main,/if\(currentMatches\.length!==1\|\|currentMatches\[0\]\.unavailableMessage\)return/);
  assert.match(main,/selectVehicle\(currentMatches\[0\]\)/);
  assert.match(main,/submitSingleOnEnter\)queueMicrotask\(\(\)=>root\.closest\('form'\)\?\.requestSubmit\(\)\)/);
  assert.match(main,/autoOpen:true,submitSingleOnEnter:true/);
  assert.match(main,/#assign-spot-form'\)\?\.addEventListener\('keydown'/);
});
