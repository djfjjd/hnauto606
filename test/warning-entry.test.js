import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const data=readFileSync(new URL('../src/data.js',import.meta.url),'utf8');

test('상품화출차 팝업 오른쪽 위에서 차량별 경고등 입력을 연다',()=>{
  assert.match(main,/warning-entry-button[^>]*data-warning-entry>경고등입력/);
  assert.match(main,/state\.mode='warning-entry';render\(\)/);
  assert.match(main,/function warningForm\(s\).*STATUS\.map.*s\.alerts\.includes\(x\.id\)/s);
  assert.match(css,/\.warning-entry-button\s*\{[^}]*position:absolute;[^}]*right:64px;[^}]*top:20px;/);
});

test('경고등은 요청한 명칭을 가나다순으로 파비콘과 함께 표시한다',()=>{
  const expected=['냉각수부족경고등','라이트경고등','배터리경고등','엔진경고등','엔진오일부족경고등','엔진오일압력경고등','요소수경고등','주유경고등','타이어공기압 경고등','통합경고등','ABS경고등'];
  let previous=-1;
  for(const label of expected){const position=data.indexOf(`label:'${label}'`);assert.ok(position>previous,`${label} 순서를 확인해 주세요.`);previous=position;}
  assert.match(main,/warning-status-list.*<img src="\/\$\{esc\(x\.icon\.normalize\('NFD'\)\)\}" alt="">\$\{x\.label\}/s);
  for(const icon of ['냉각수부족경고등.png','라이트경고등.png','배터리경고등.png','엔진경고등.png','엔진오일부족경고등.png','엔진오일압력경고등.png','요소수경고등.png','주유경고등.png','타이어공기압.png','통합경고등.png','ABS경고등.png'])assert.match(data,new RegExp(`icon:'${icon}'`));
  assert.match(css,/\.warning-status-list\s*\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});

test('경고등 저장은 상품화출차 없이 상태 목록만 교체한다',()=>{
  assert.match(main,/api\(`vehicles\/\$\{vehicle\.vehicleId\}\/statuses`,\{method:'PUT'/);
  const route=api.slice(api.indexOf("if(method==='PUT'&&parts[0]==='vehicles'&&parts[1]&&parts[2]==='statuses')"),api.indexOf("if(method==='POST'&&parts[0]==='vehicles'&&parts[1]&&parts[2]==='status')"));
  assert.match(route,/DELETE FROM vehicle_status WHERE vehicle_id=\?/);
  assert.match(route,/INSERT INTO vehicle_status/);
  assert.doesNotMatch(route,/parking_spots|current_spot_id|parking_movements|notification_events|productization|notifyVehicle/);
});

test('확인 필요 재성능 차량은 한 줄에 세 대씩 줄바꿈 없이 표시한다',()=>{
  assert.match(main,/details\.split\(\/\\s\+\/\).*<span>\$\{detail\}<\/span>/);
  assert.match(css,/\.metric\.amber \.metric-details\s*\{[^}]*grid-template-columns:repeat\(3,max-content\)/);
  assert.match(css,/\.metric\.amber \.metric-details span\s*\{[^}]*white-space:nowrap/);
});
