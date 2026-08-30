import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('모바일 엔카 진단 예약은 앱을 우선 열고 웹 주소로 대체한다',()=>{
  assert.match(main,/data-encar-app/);
  assert.match(main,/package=com\.encar\.encarMobileApp/);
  assert.match(main,/location\.href='encar:\/\/'/);
  assert.match(main,/location\.href=webUrl/);
  assert.match(main,/addEventListener\('click',openEncarApp\)/);
});
