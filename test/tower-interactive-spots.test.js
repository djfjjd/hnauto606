import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parkingLayouts} from '../src/parking-layouts.js';
import {renderParkingMap} from '../src/parking-map.js';

const targets=['K01','L01','M02','M03','M04','M05','M06','M07','D21','A25','A24','A23','A22','A21'];
const migration=readFileSync(new URL('../migrations/0038_activate_tower_interactive_spots.sql',import.meta.url),'utf8');

test('B5 27~34번과 B6 05~10번을 실제 활성 주차면으로 보정한다',()=>{
  for(const label of targets){
    assert.match(migration,new RegExp(`'tower-grid-${label}','tower','${label}',1`));
    assert.match(migration,new RegExp(`'${label}'`));
  }
  assert.match(migration,/UPDATE parking_spots[\s\S]*SET active=1/);
});

test('대상 주차면은 접기와 펼치기 화면에서 클릭 가능한 버튼으로 렌더링된다',()=>{
  const spots=targets.map((label,index)=>({id:`target-${label}`,label,plate:index===0?'12가3456':'',model:'그랜저',alerts:[]}));
  for(const expanded of [false,true]){
    const html=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded});
    for(const label of targets)assert.match(html,new RegExp(`<button[^>]+data-spot="target-${label}"`));
    assert.match(html,/data-spot="target-K01" draggable="true"/);
  }
});
