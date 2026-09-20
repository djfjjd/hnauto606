import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const data=readFileSync(new URL('../src/data.js',import.meta.url),'utf8');
const layout=readFileSync(new URL('../src/parking-layouts.js',import.meta.url),'utf8');

test('오토플렉스 13층 12자리는 주차 구역과 배치도에서 제외한다',()=>{
  assert.doesNotMatch(data,/auto13|오토플렉스/);
  assert.doesNotMatch(layout,/auto13|오토플렉스/);
});
