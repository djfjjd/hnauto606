import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('모바일 축소 화면에서 입력 포커스 자동 확대를 차단한다',()=>{
  assert.match(html,/name="viewport" content="width=780, maximum-scale=1, user-scalable=no"/);
  assert.match(css,/@media\(max-width:800px\)\{\.search input,\.modal input,\.modal select,\.modal textarea,\.vehicle-list-search input,\.compact-assign input\{font-size:18px!important\}\}/);
});

test('모든 주차 도면 Cell은 가독성 크기로 표시한다',()=>{
  assert.match(css,/grid-template-columns:29px repeat\(var\(--map-columns\),65px\)/);
  assert.match(css,/grid-template-rows:23px repeat\(var\(--map-rows\),39px\)/);
  assert.match(css,/\.parking-cell\.is-vacant strong\{font-size:12px;letter-spacing:-\.06em;white-space:nowrap\}/);
  assert.match(css,/\.parking-cell\.is-occupied span\{color:#111!important\}/);
  assert.match(css,/vehicle-color-black span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-gray span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-red span,.parking-cell\.is-occupied:not\(\.has-alert\)\.vehicle-color-blue span\{color:#fff!important\}/);
});

test('전체 보기에서 B3·B5 오른쪽에 새싹을 배치하고 13층은 아래에 둔다',()=>{
  assert.match(css,/data-map-zone="pillar11"\]\{grid-column:1\/span 3;grid-row:1\}/);
  assert.match(css,/data-map-zone="roof"\]\{grid-column:4\/span 3;grid-row:1\}/);
  assert.match(css,/data-map-zone="b3"\]\{grid-column:1\/span 3;grid-row:2\}/);
  assert.match(css,/data-map-zone="b5"\]\{grid-column:1\/span 3;grid-row:3\}/);
  assert.match(css,/data-map-zone="tower"\]\{grid-column:4\/span 3;grid-row:2\/span 2\}/);
  assert.match(css,/data-map-zone="auto13"\]\{grid-column:1\/span 3;grid-row:4\}/);
});
