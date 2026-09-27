import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parkingLayouts} from '../src/parking-layouts.js';
import {renderParkingMap} from '../src/parking-map.js';

const targets=['K01','L01','M02','M03','M04','M05','M06','M07','D17','D18','D19','D20','D21','A25','A24','A23','A22','A21','A20','A19','A17','A16','B14','C14','D14','E14'];
const migration=readFileSync(new URL('../migrations/0038_activate_tower_interactive_spots.sql',import.meta.url),'utf8');
const forcedMigration=readFileSync(new URL('../migrations/0040_force_tower_interactive_spots.sql',import.meta.url),'utf8');
const b6Migration=readFileSync(new URL('../migrations/0041_activate_tower_b6_through_20.sql',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('B5 27~34번과 B6 01~20번을 실제 활성 주차면으로 보정한다',()=>{
  for(const label of targets){
    assert.match(api,new RegExp(`'${label}'`));
  }
  for(const label of targets.slice(0,18))assert.match(forcedMigration,new RegExp(`'tower-grid-${label}','tower','${label}',1`));
  for(const label of targets.slice(18))assert.match(b6Migration,new RegExp(`'tower-grid-${label}','tower','${label}',1`));
  assert.match(migration,/UPDATE parking_spots[\s\S]*SET active=1/);
  assert.match(b6Migration,/UPDATE parking_spots[\s\S]*SET active=1/);
  assert.match(api,/async function ensureTowerInteractiveSpots\(db\)/);
  assert.match(api,/viewer\/dashboard'\)\{await ensureTowerInteractiveSpots\(env\.DB\)/);
  assert.match(api,/parts\[0\]==='dashboard'\)\{await ensureTowerInteractiveSpots\(env\.DB\)/);
});

test('대상 주차면은 접기와 펼치기 화면에서 클릭 가능한 버튼으로 렌더링된다',()=>{
  const spots=targets.map((label,index)=>({id:`target-${label}`,label,plate:index===0?'12가3456':'',model:'그랜저',alerts:[]}));
  const collapsed=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:true});
  for(const label of targets)assert.match(expanded,new RegExp(`<button[^>]+data-spot="target-${label}"`));
  assert.equal((collapsed.match(/class="parking-cell/g)||[]).length,20);
  assert.match(collapsed,/data-spot="target-K01" draggable="true"/);
  assert.doesNotMatch(collapsed,/data-spot="target-A24"/);
});

test('펼치기는 실제 B6 좌표를 유지하고 접기는 빈 앞번호를 차량 뒤로 정렬한다',()=>{
  const spots=[
    {id:'b6-01',label:'D17',plate:'',alerts:[]},
    {id:'b6-20',label:'E14',plate:'12가2020',model:'차량',alerts:[]},
  ];
  const collapsed=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:true});
  assert.match(expanded,/data-spot="b6-01"[^>]*aria-label="D17 빈 자리"/);
  assert.match(expanded,/data-spot="b6-20" draggable="true"[^>]*aria-label="E14 12가2020 주차 중"/);
  assert.ok(collapsed.indexOf('data-spot="b6-20"')<collapsed.indexOf('data-spot="b6-01"'));
});
