import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('선택차량목록 카드에서 담당자를 작성일 왼쪽에 표시한다',()=>{
  assert.match(main,/class="heydealer-record-byline"><span>담당자 : \$\{esc\(record\.manager\)\|\|'-'\}<\/span><time datetime="\$\{esc\(record\.record_date\)\}">/);
  assert.match(css,/\.heydealer-record-byline\{display:flex;align-items:center;justify-content:flex-end/);
});

test('펼치기 버튼은 담당자와 날짜 오른쪽에 붙고 접힌 카드는 여백을 줄인다',()=>{
  assert.match(css,/\.heydealer-record-details>summary\{position:absolute;top:28px;right:28px/);
  assert.match(css,/\.heydealer-record-meta\{padding-right:58px\}/);
  assert.match(css,/\.heydealer-record-details:not\(\[open\]\)\{height:0;margin-top:0!important\}/);
  assert.match(css,/\.heydealer-record:not\(:has\(\.heydealer-record-details\[open\]\)\)\{padding-block:20px\}/);
});
