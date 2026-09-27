import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../migrations/0036_resequence_tower_vehicles.sql',import.meta.url),'utf8');

test('기존 새싹 차량 18대를 B5 21번부터 B6 06번까지 재배치한다',()=>{
  const targets=['E01','F01','I01','J01','K01','L01','M02','M03','M04','M05','M06','M07','D17','D18','D19','D20','D21','A25'];
  assert.match(migration,/WHERE s\.zone_id='tower'/);
  assert.match(migration,/LIMIT 18/);
  for(const [index,label] of targets.entries())assert.match(migration,new RegExp(`\\(${index+1},'${label}'\\)`));
  assert.match(migration,/UPDATE parking_spots[\s\S]*SET current_vehicle_id=NULL/);
  assert.match(migration,/UPDATE vehicles[\s\S]*SET current_spot_id=\(/);
});
