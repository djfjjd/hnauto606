import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('iOS 엔카 진단 예약은 유효한 웹 주소로 연다',()=>{
  assert.match(main,/data-encar-app/);
  assert.match(main,/package=com\.encar\.encarMobileApp/);
  assert.match(main,/location\.href=webUrl/);
  assert.doesNotMatch(main,/started=Date\.now\(\),fallback/);
  assert.match(main,/addEventListener\('click',openEncarApp\)/);
});
