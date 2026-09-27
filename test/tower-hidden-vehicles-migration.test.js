import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../migrations/0037_place_hidden_tower_vehicles.sql',import.meta.url),'utf8');

test('새싹의 네 차량을 제외하고 나머지 14대를 B5 27번부터 B6 06번까지 배치한다',()=>{
  const targets=['K01','L01','M02','M03','M04','M05','M06','M07','D17','D18','D19','D20','D21','A25'];
  assert.match(migration,/vehicle_spot\.zone_id='tower'/);
  assert.match(migration,/board_spot\.current_vehicle_id=v\.id AND board_spot\.zone_id='tower'/);
  assert.match(migration,/NOT IN \('4121','2927','9214','6856'\)/);
  assert.match(migration,/LIMIT 14/);
  for(const [index,label] of targets.entries())assert.match(migration,new RegExp(`\\(${index+1},'${label}'\\)`));
});
