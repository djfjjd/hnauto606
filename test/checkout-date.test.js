import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('출고 팝업은 오늘 날짜를 기본값으로 하는 수정 가능한 출고일을 제공한다',()=>{
  assert.match(main,/function checkoutForm\(\)\{const today=new Date\(\)\.toLocaleDateString\('en-CA'\)/);
  assert.match(main,/type="date" name="checkedOutDate" value="\$\{today\}" required/);
  assert.match(main,/JSON\.stringify\(\{checkedOutDate\}\)/);
});

test('출고 API는 출고일을 검증해 차량과 감사 이력에 저장한다',()=>{
  assert.match(api,/checkedOutDate=validDate\(input\?\.checkedOutDate\)/);
  assert.match(api,/checked_out_at=\?/);
  assert.match(api,/JSON\.stringify\(\{checkedOutDate\}\)/);
});

test('출고 API는 현재 주차면을 유지하고 출고 상태만 기록한다',()=>{
  const start=api.indexOf("parts[2]==='check-out'");
  const end=api.indexOf("parts[2]==='status'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/UPDATE vehicles SET checked_out_at=\?/);
  assert.doesNotMatch(handler,/current_spot_id=NULL/);
  assert.doesNotMatch(handler,/UPDATE parking_spots SET current_vehicle_id=NULL/);
});

test('출고 차량도 주차면에서 나중에 삭제할 수 있다',()=>{
  const start=api.indexOf("parts[2]==='unassign'");
  const end=api.indexOf("parts[2]==='check-out'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/SELECT id,plate,model,current_spot_id,version FROM vehicles WHERE id=\?/);
  assert.doesNotMatch(handler,/checked_out_at IS NULL/);
});

test('출고 차량도 빈 자리 이동과 차량 간 자리 교환을 할 수 있다',()=>{
  const moveStart=api.indexOf("parts[2]==='move'");
  const swapStart=api.indexOf("parts[2]==='swap'",moveStart);
  const unassignStart=api.indexOf("parts[2]==='unassign'",swapStart);
  const moveHandler=api.slice(moveStart,swapStart);
  const swapHandler=api.slice(swapStart,unassignStart);
  assert.match(moveHandler,/SELECT id,plate,current_spot_id,version FROM vehicles WHERE id=\?/);
  assert.doesNotMatch(moveHandler,/checked_out_at IS NULL/);
  assert.doesNotMatch(swapHandler,/checked_out_at IS NULL/);
});
