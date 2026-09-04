import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('차량 선택 검색어가 비어 있으면 안내 문구와 목록을 표시하지 않는다',()=>{
  assert.doesNotMatch(main,/차량 검색어를 입력해 주세요/);
  assert.match(main,/options\.innerHTML=!query\?'':currentMatches\.length/);
});

test('출고 차량은 주차·상품화·미배정을 포함한 차량현황판 전체에서 선택한다',()=>{
  assert.match(main,/차량현황판에 등록된 모든 차량을 출고할 수 있습니다\./);
  assert.match(main,/checkoutPickerRoot\?createVehicleListPicker\(checkoutPickerRoot,\{vehicles:boardVehicles\(\)\.filter\(vehicle=>!vehicle\.isCheckedOut\)\.map/);
  assert.match(main,/function boardVehicles\(\)\{return\[\.\.\.new Map\(\[\.\.\.state\.spots\.filter\(used\),\.\.\.state\.checkedOut\]/);
});

test('빈 자리 배정 목록에서 미배정 차량과 아직 주차되지 않은 출고 차량을 검색한다',()=>{
  assert.match(main,/assignableVehicles=\[\.\.\.state\.unassigned,\.\.\.state\.checkedOut\.filter\(vehicle=>!vehicle\.currentSpotId\)\]/);
  assert.match(main,/vehicle\.isCheckedOut\?'assign-checked-out':'move'/);
});

test('빈 자리 차량 검색 결과가 한 대면 Enter로 선택하고 즉시 저장한다',()=>{
  assert.match(main,/submitSingleOnEnter=false/);
  assert.match(main,/if\(currentMatches\.length!==1\)return/);
  assert.match(main,/selectVehicle\(currentMatches\[0\]\)/);
  assert.match(main,/submitSingleOnEnter\)queueMicrotask\(\(\)=>root\.closest\('form'\)\?\.requestSubmit\(\)\)/);
  assert.match(main,/autoOpen:true,submitSingleOnEnter:true/);
  assert.match(main,/#assign-spot-form'\)\?\.addEventListener\('keydown'/);
});
