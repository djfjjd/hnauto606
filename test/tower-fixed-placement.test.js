import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0039_place_named_tower_vehicles.sql',import.meta.url),'utf8');
const placements=[['9511','K01'],['9439','L01'],['8424','M02'],['6676','M03'],['4579','M04'],['7601','M05'],['4124','M06'],['4248','M07'],['7446','D17'],['1626','D18'],['6691','D19'],['5495','D20']];

test('지정 차량 12대는 일회성 마이그레이션으로만 배치하고 이후 자유롭게 이동한다',()=>{
  for(const [ending,label] of placements){
    assert.match(migration,new RegExp(`\\('${ending}','${label}'\\)`));
  }
  assert.doesNotMatch(api,/TOWER_FIXED_PLACEMENTS|ensureTowerFixedPlacements/);
  assert.match(api,/viewer\/dashboard'\)\{await ensureTowerInteractiveSpots\(env\.DB\);const/);
  assert.match(api,/parts\[0\]==='dashboard'\)\{await ensureTowerInteractiveSpots\(env\.DB\);return json/);
});
