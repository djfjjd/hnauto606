import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const layout=readFileSync(new URL('../src/parking-layouts.js',import.meta.url),'utf8');

test('오토플렉스 13층은 주차구역 탭과 배치도에서 숨기고 기존 주차면 데이터는 유지한다',()=>{
  assert.match(css,/\.zone-tabs \[data-zone="auto13"\],\.zones>\.parking-map\[data-map-zone="auto13"\]\{display:none!important\}/);
  assert.match(layout,/auto13:baseLayout\('오토플렉스 13층'/);
  assert.match(layout,/parkingRanges:\[\{from:'A09',to:'D11'\}\]/);
});
