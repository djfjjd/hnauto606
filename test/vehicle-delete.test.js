import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('차량 행 연필 오른쪽에 영구 삭제 휴지통 버튼을 표시한다',()=>{
  assert.match(main,/class="board-row-actions"/);
  assert.match(main,/class="board-delete-icon" data-delete-vehicle=/);
  assert.match(main,/잘못 등록한 차량 삭제/);
  assert.match(css,/\.board-delete-icon\{/);
});

test('차량 삭제 전에 되돌릴 수 없다는 확인을 받고 DELETE API를 호출한다',()=>{
  assert.match(main,/function deleteDashboardVehicle\(button\)/);
  assert.match(main,/이 작업은 되돌릴 수 없습니다/);
  assert.match(main,/api\(`vehicles\/\$\{vehicleId\}`,\{method:'DELETE'\}\)/);
  assert.match(main,/event\.target\.closest\('\[data-delete-vehicle\]'\)/);
});

test('차량 삭제 API는 주차면과 종속 이력을 한 배치로 정리하고 감사 기록을 보존한다',()=>{
  const start=api.indexOf("method==='DELETE'&&parts[0]==='vehicles'");
  const end=api.indexOf("parts.join('/')==='vehicles/reorder'",start);
  const handler=api.slice(start,end);
  assert.match(handler,/UPDATE parking_spots SET current_vehicle_id=NULL/);
  assert.match(handler,/DELETE FROM vehicle_status WHERE vehicle_id=\?/);
  assert.match(handler,/DELETE FROM service_records WHERE vehicle_id=\?/);
  assert.match(handler,/DELETE FROM parking_movements WHERE vehicle_id=\?/);
  assert.match(handler,/UPDATE notification_events SET vehicle_id=NULL/);
  assert.match(handler,/DELETE FROM vehicles WHERE id=\?/);
  assert.match(handler,/delete_mistaken_vehicle/);
});

test('R2 파일 메타데이터가 있는 차량은 고아 파일 방지를 위해 삭제를 차단한다',()=>{
  assert.match(api,/SELECT COUNT\(\*\) FROM vehicle_files/);
  assert.match(api,/첨부파일이 있는 차량은 파일을 먼저 정리한 뒤 삭제해 주세요/);
});
