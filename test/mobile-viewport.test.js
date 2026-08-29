import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('모바일 축소 화면에서 입력 포커스 자동 확대를 차단한다',()=>{
  assert.match(html,/name="viewport" content="width=780, maximum-scale=1, user-scalable=no"/);
  assert.match(css,/@media\(max-width:800px\)\{\.search input,\.modal input,\.modal select,\.modal textarea,\.vehicle-list-search input,\.compact-assign input\{font-size:18px!important\}\}/);
});
