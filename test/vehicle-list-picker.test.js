import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('차량 선택 검색어가 비어 있으면 안내 문구와 목록을 표시하지 않는다',()=>{
  assert.doesNotMatch(main,/차량 검색어를 입력해 주세요/);
  assert.match(main,/options\.innerHTML=!query\?'':matches\.length/);
});

test('출고 차량은 차량현황판의 미배정 차량에서만 선택한다',()=>{
  assert.match(main,/차량현황판에 있는 차량만 출고할 수 있습니다\./);
  assert.match(main,/checkoutPickerRoot\?createVehicleListPicker\(checkoutPickerRoot,\{vehicles:state\.unassigned\.map/);
  assert.doesNotMatch(main,/checkoutPickerRoot\?createVehicleListPicker\(checkoutPickerRoot,\{vehicles:state\.spots\.filter/);
});
