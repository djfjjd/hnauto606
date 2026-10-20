import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const migration=readFileSync(new URL('../migrations/0047_activate_roof_a16_c16.sql',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('옥상 병합 Cell의 A16과 C16을 실제 선택 가능한 주차면으로 생성하고 활성화한다',()=>{
  for(const label of ['A16','C16']){
    assert.match(migration,new RegExp(`'roof-grid-${label}','roof','${label}',1`));
    assert.match(handler,new RegExp(`'roof-grid-${label}','roof','${label}',1`));
  }
  assert.match(migration,/label IN \('A16','C16','A17'\)/);
  assert.match(handler,/function ensureRoofMergedSpots\(db\)/);
  assert.match(handler,/label IN \('A16','C16','A17'\)/);
  assert.match(handler,/Promise\.all\(\[ensurePillar11ExtraSpots\(db\),ensureRoofMergedSpots\(db\)\]\)/);
});
