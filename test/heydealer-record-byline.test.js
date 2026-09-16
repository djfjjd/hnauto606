import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('선택차량목록 카드에서 담당자를 작성일 왼쪽에 표시한다',()=>{
  assert.match(main,/class="heydealer-record-byline"><span>담당자 : \$\{esc\(record\.manager\)\|\|'-'\}<\/span><time datetime="\$\{esc\(record\.record_date\)\}">/);
  assert.match(css,/\.heydealer-record-byline\{display:flex;align-items:center;justify-content:flex-end/);
});
