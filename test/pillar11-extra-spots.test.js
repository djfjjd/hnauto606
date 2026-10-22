import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0047_deactivate_pillar11_a05_c06.sql',import.meta.url),'utf8');

test('6층 A05~C06을 API와 마이그레이션에서 비활성화한다',()=>{
  assert.match(handler,/SET active=0[^;]+label IN \('A05','B05','C05','A06','B06','C06'\)/);
  assert.match(migration,/SET active=0[^;]+label IN \('A05','B05','C05','A06','B06','C06'\)/s);
});
