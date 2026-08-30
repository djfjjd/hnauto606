import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('차량 현황판에 색상과 옵션 사이 입고일을 표시한다',()=>{
  assert.match(main,/<span>색상<\/span><span>입고일<\/span><span>옵션<\/span>/);
  assert.match(main,/String\(s\.checkedInAt\|\|''\)\.slice\(0,10\)/);
});

test('상단 브랜드를 간결하게 표시하고 구글 드라이브 업무 링크를 제공한다',()=>{
  assert.doesNotMatch(main,/HANA AUTO/);
  assert.match(main,/https:\/\/drive\.google\.com\/drive\/folders\/1k4BU4_b2khbN2iY9neB43Fqms58J2GaU\?usp=drive_link/);
  assert.match(main,/>구글드라이브<\/a>/);
});

test('주차 차량과 상품화 차량을 분리해 다섯 개 통계 카드로 표시한다',()=>{
  assert.match(main,/occupied:parked,productization/);
  assert.match(main,/metric\('주차 차량',c\.occupied,'IN USE','dark'\)\}\$\{metric\('상품화',c\.productization,'PRODUCT','product'\)\}\$\{metric\('빈 자리'/);
  assert.match(css,/\.summary\s*\{[^}]*grid-template-columns:repeat\(5,1fr\)/);
});

test('검색 결과가 많아도 다섯 행 높이 안에서 스크롤한다',()=>{
  assert.match(css,/\.parking-search-results\{[^}]*max-height:335px[^}]*overflow-y:auto/);
});
