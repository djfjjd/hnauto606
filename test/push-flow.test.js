import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('푸시 알림 차종은 기본 두 단어, 두 번째 단어가 한 글자면 세 단어로 표시한다',()=>{
  assert.match(api,/const pushVehicleLabel=vehicle=>/);
  assert.match(api,/pushVehicleModel=model=>\{const words=String\(model\|\|''\)\.trim\(\)\.split\(\/\\s\+\/\)\.filter\(Boolean\);return words\.slice\(0,words\[1\]\?\.length===1\?3:2\)\.join\(' '\)\|\|'차종 미입력';\}/);
  assert.match(api,/pushVehicleLabel=vehicle=>`\$\{String\(vehicle\.plate\|\|''\)\.slice\(-4\)\}\(\$\{pushVehicleModel\(vehicle\.model\)\}\)`/);
  assert.match(api,/const pushBody=vehicle=>`\$\{pushVehicleLabel\(vehicle\)\}, \$\{vehicle\.zone_name\|\|'차량현황판'\}`/);
});

test('신규 입고 저장 후 Web Push를 발송한다',()=>{
  assert.match(api,/notifyVehicleAction\(context,\{id:vehicleId,plate:valid\.value\.plate,model:valid\.value\.model\},'신규 차량 입고',manager,eventId\)/);
  assert.match(api,/JSON\.stringify\(\{plate:valid\.value\.plate,manager\}\)/);
  assert.match(api,/bind\(eventId,'check_in',vehicleId/);
});

test('출고 저장 후 Web Push를 발송한다',()=>{
  assert.match(api,/notifyVehicleAction\(context,vehicle,'차량 출고','출고',eventId\)/);
  assert.match(api,/bind\(eventId,'check_out',vehicle\.id/);
});

test('계약 상태로 처음 변경할 때 Web Push를 발송한다',()=>{
  const start=api.indexOf("parts[2]==='contract'");
  const end=api.indexOf("parts[2]==='cancel-contract'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/eventId=existing\?null:id\(\)/);
  assert.match(handler,/bind\(eventId,'contract',vehicle\.id/);
  assert.match(handler,/if\(eventId\)notifyVehicleAction\(context,vehicle,'차량 계약','계약',eventId\)/);
});

test('프롬프트양식 저장 완료 후 전체 차량번호로 캘린더 추가 알림을 발송한다',()=>{
  assert.match(api,/function notifyCalendarAdd/);
  assert.match(api,/body:`\$\{record\.plate\}, 캘린더 추가`/);
  assert.match(api,/eventId,'calendar_add'/);
  assert.match(api,/notifyCalendarAdd\(context,record,eventId\)/);
});

test('차량 위치 교환은 두 차량과 새 위치를 한 알림으로 발송한다',()=>{
  assert.match(api,/function notifyVehicleSwap/);
  assert.match(api,/body:`\$\{pushBody\(source\)\} ↔ \$\{pushBody\(target\)\}`/);
  assert.match(api,/await notifyVehicleSwap\(context,source\.id,target\.id,eventId\)/);
  assert.doesNotMatch(api,/Promise\.all\(\[notifyVehicleLocation\(context,source\.id\),notifyVehicleLocation\(context,target\.id\)\]\)/);
});

test('주차구역에서 삭제한 차량은 축약된 차량번호와 차종 및 출차를 알린다',()=>{
  const start=api.indexOf("parts[2]==='unassign'");
  const end=api.indexOf("parts[2]==='check-out'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/SELECT id,plate,model,current_spot_id,version FROM vehicles/);
  assert.match(api,/function notifyVehicleDeparture\(context,vehicle\).*title:'차량 출차',body:pushBody\(\{\.\.\.vehicle,zone_name:'출차'\}\)/);
  assert.match(handler,/notifyVehicleDeparture\(context,vehicle\)/);
  assert.doesNotMatch(handler,/상품화출차/);
  assert.doesNotMatch(handler,/notifyVehicleLocation\(context,vehicle\.id\)/);
});
