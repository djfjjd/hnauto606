import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0046_activate_pillar11_a05_c05.sql',import.meta.url),'utf8');

test('6층 A05~C05를 실제 선택 가능한 주차면으로 생성하고 활성화한다',()=>{
  for(const label of ['A05','B05','C05']){
    assert.match(handler,new RegExp(`'pillar11-grid-${label}','pillar11','${label}',1`));
    assert.match(migration,new RegExp(`'pillar11-grid-${label}','pillar11','${label}',1`));
  }
  assert.match(handler,/label IN \('A05','B05','C05','A06','B06','C06'\)/);
  assert.match(migration,/label IN \('A05','B05','C05'\)/);
});
