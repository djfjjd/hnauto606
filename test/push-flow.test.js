import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('신규 입고 저장 후 Web Push를 발송한다',()=>{
  assert.match(api,/notifyVehicleAction\(context,\{id:vehicleId,plate:valid\.value\.plate,model:valid\.value\.model\},'신규 차량 입고',manager,eventId\)/);
  assert.match(api,/JSON\.stringify\(\{plate:valid\.value\.plate,manager\}\)/);
  assert.match(api,/bind\(eventId,'check_in',vehicleId/);
});

test('출고 저장 후 Web Push를 발송한다',()=>{
  assert.match(api,/notifyVehicleAction\(context,vehicle,'차량 출고','출고',eventId\)/);
  assert.match(api,/bind\(eventId,'check_out',vehicle\.id/);
});

test('차량 위치 교환은 두 차량과 새 위치를 한 알림으로 발송한다',()=>{
  assert.match(api,/function notifyVehicleSwap/);
  assert.match(api,/body:`\$\{label\(source\)\} ↔ \$\{label\(target\)\}`/);
  assert.match(api,/await notifyVehicleSwap\(context,source\.id,target\.id,eventId\)/);
  assert.doesNotMatch(api,/Promise\.all\(\[notifyVehicleLocation\(context,source\.id\),notifyVehicleLocation\(context,target\.id\)\]\)/);
});

test('주차구역에서 삭제한 차량은 상품화출차 위치로 알린다',()=>{
  const start=api.indexOf("parts[2]==='unassign'");
  const end=api.indexOf("parts[2]==='check-out'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/SELECT id,plate,model,current_spot_id,version FROM vehicles/);
  assert.match(handler,/notifyVehicleAction\(context,vehicle,'차량 위치 변경','상품화출차'\)/);
  assert.doesNotMatch(handler,/notifyVehicleLocation\(context,vehicle\.id\)/);
});
