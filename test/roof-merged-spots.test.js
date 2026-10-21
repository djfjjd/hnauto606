import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../migrations/0048_deactivate_roof_a16_c16.sql',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('제거한 옥상 A16과 C16은 빈자리일 때 비활성화하고 API에서 다시 만들지 않는다',()=>{
  assert.match(migration,/zone_id='roof' AND label IN \('A16','C16'\)/);
  assert.match(migration,/current_vehicle_id IS NULL/);
  assert.doesNotMatch(handler,/ensureRoofMergedSpots|roof-grid-A16|roof-grid-C16/);
});
