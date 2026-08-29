import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('모바일 축소 화면에서 입력 포커스 자동 확대를 차단한다',()=>{
  assert.match(html,/name="viewport" content="width=780, maximum-scale=1, user-scalable=no"/);
  assert.match(css,/@media\(max-width:800px\)\{\.search input,\.modal input,\.modal select,\.modal textarea,\.vehicle-list-search input,\.compact-assign input\{font-size:18px!important\}\}/);
});

test('모든 주차 도면 Cell은 기존 크기의 절반으로 표시한다',()=>{
  assert.match(css,/grid-template-columns:19px repeat\(var\(--map-columns\),36px\)/);
  assert.match(css,/grid-template-rows:15px repeat\(var\(--map-rows\),26px\)/);
  assert.match(css,/\.parking-cell\.is-vacant strong\{font-size:8px;letter-spacing:-\.08em;white-space:nowrap\}/);
  assert.match(css,/\.parking-cell\.is-occupied span\{color:#111!important\}/);
});

test('전체 보기에서 B5층을 B3층 바로 아래에 배치한다',()=>{
  assert.match(css,/data-map-zone="pillar11"\]\{grid-column:1\/span 3;grid-row:1\}/);
  assert.match(css,/data-map-zone="roof"\]\{grid-column:4\/span 3;grid-row:1\}/);
  assert.match(css,/data-map-zone="b3"\]\{grid-column:1\/span 2;grid-row:2\}/);
  assert.match(css,/data-map-zone="b5"\]\{grid-column:1\/span 2;grid-row:3\}/);
  assert.match(css,/data-map-zone="auto13"\]\{grid-column:5\/span 2;grid-row:2\}/);
  assert.match(css,/data-map-zone="tower"\]\{grid-column:1\/span 2;grid-row:4\}/);
});
