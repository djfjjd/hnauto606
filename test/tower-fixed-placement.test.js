import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0039_place_named_tower_vehicles.sql',import.meta.url),'utf8');
const placements=[['9511','K01'],['9439','L01'],['8424','M02'],['6676','M03'],['4579','M04'],['7601','M05'],['4124','M06'],['4248','M07'],['7446','D17'],['1626','D18'],['6691','D19'],['5495','D20']];

test('지정 차량 12대를 B5 27번부터 B6 04번까지 고정 배치한다',()=>{
  for(const [ending,label] of placements){
    assert.match(api,new RegExp(`\\['${ending}','${label}'\\]`));
    assert.match(migration,new RegExp(`\\('${ending}','${label}'\\)`));
  }
  assert.match(api,/async function ensureTowerFixedPlacements\(db\)/);
  assert.match(api,/viewer\/dashboard'\)\{await ensureTowerFixedPlacements\(env\.DB\)/);
  assert.match(api,/parts\[0\]==='dashboard'\)\{await ensureTowerFixedPlacements\(env\.DB\)/);
  assert.match(api,/UPDATE parking_spots SET current_vehicle_id=\?,active=1/);
});
