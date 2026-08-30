import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('모바일 엔카 진단 예약은 엔카 앱 핸들을 우선 연다',()=>{
  assert.match(main,/data-encar-app/);
  assert.match(main,/package=com\.encar\.encarMobileApp/);
  assert.match(main,/location\.href='encar::'/);
  assert.doesNotMatch(main,/started=Date\.now\(\),fallback/);
  assert.match(main,/addEventListener\('click',openEncarApp\)/);
});
