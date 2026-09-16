import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0021_add_rentcar_records.sql',import.meta.url),'utf8');

test('상단에 렌터카 매입 입력과 목록 하위 메뉴를 제공한다',()=>{
  assert.match(main,/렌터카매입정보/);
  assert.match(main,/href="\/rentcar">차량정보입력/);
  assert.match(main,/href="\/rentcar\/vehicles">렌터카매입차량목록/);
  assert.match(main,/location\.pathname\.startsWith\('\/rentcar'\)/);
});

test('렌터카 입력은 담당자와 색상을 선택하고 부가정보를 선택 항목으로 표시한다',()=>{
  assert.match(main,/name="manager" required>\$\{managerOptions\(\)\}/);
  assert.match(main,/name==='color'/);
  for(const field of ['options','notes','price','account','origin','departureTime'])assert.match(main,new RegExp(`rentcarField\\('${field}'[^)]*true\\)`));
  assert.doesNotMatch(main,/렌터카 차량정보 원문|매입지급정보 원문/);
});

test('렌터카 매입 차량을 D1에 저장하고 신규 입고 불러오기에 합친다',()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS rentcar_records/);
  assert.match(handler,/if\(parts\[0\]==='rentcar'\)/);
  assert.match(handler,/INSERT INTO rentcar_records/);
  assert.match(main,/const rentcar=await api\('rentcar'\)/);
  assert.match(main,/record\.source==='rentcar'\?'\[렌터카\] '/);
});
