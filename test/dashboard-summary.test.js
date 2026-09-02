import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('차량 현황판에 km·색상·입고일·옵션을 순서대로 표시한다',()=>{
  assert.match(main,/<span>연식<\/span><span>km<\/span><span>색상<\/span><span>입고일<\/span><span>옵션<\/span>/);
  assert.match(main,/String\(s\.checkedInAt\|\|''\)\.slice\(0,10\)/);
});

test('상단 브랜드를 간결하게 표시하고 구글 드라이브 업무 링크를 제공한다',()=>{
  assert.doesNotMatch(main,/HANA AUTO/);
  assert.match(main,/https:\/\/drive\.google\.com\/drive\/folders\/1k4BU4_b2khbN2iY9neB43Fqms58J2GaU\?usp=drive_link/);
  assert.match(main,/<a href="\/drive">헤이딜러<\/a>/);
});

test('주차 차량과 상품화 차량을 분리해 다섯 개 통계 카드로 표시한다',()=>{
  assert.match(main,/occupied:parked,productization/);
  assert.match(main,/metric\('주차 차량',c\.occupied,'IN USE','dark'\)\}\$\{metric\('상품화',c\.productization,'PRODUCT','product'\)\}\$\{metric\('빈 자리'/);
  assert.match(css,/\.summary\s*\{[^}]*grid-template-columns:repeat\(5,1fr\)/);
});

test('검색 결과가 많아도 다섯 행 높이 안에서 스크롤한다',()=>{
  assert.match(css,/\.parking-search-results\{[^}]*max-height:335px[^}]*overflow-y:auto/);
});

test('첫 화면 검색 결과는 보조 제목 없이 실제 값을 큰 글씨로 표시한다',()=>{
  assert.doesNotMatch(main,/<small>주차구역<\/small>|<small>차종<\/small>|<small>색상<\/small>|<small>담당자<\/small>|<small>입고날짜<\/small>|<small>특이사항<\/small>/);
  assert.match(css,/\.parking-search-results strong\{font-size:17px\}/);
  assert.match(css,/\.parking-search-results span\{[^}]*font-size:15px[^}]*font-weight:600/);
});

test('새싹타워 검색 결과는 행에 따라 B5층과 B6층을 구분한다',()=>{
  assert.match(main,/import \{normalizePosition,parkingCapacity,parkingLayouts\} from '\.\/parking-layouts\.js'/);
  assert.match(main,/function parkingSearchZoneLabel\(spot\)/);
  assert.match(main,/spot\.zoneId==='tower'/);
  assert.match(main,/row==='01'\)return'새싹 B5층'/);
  assert.match(main,/row==='02'\)return'새싹 B6층'/);
  assert.match(main,/zoneLabel=parkingSearchZoneLabel\(s\)/);
});

test('주차 검색 목록은 네 자리 완전 일치가 아닌 부분검색을 유지한다',()=>{
  assert.match(main,/matches=searchPool\.filter\(s=>used\(s\)&&\[s\.plate,s\.model,s\.color,s\.manager,s\.label,s\.zone\]\.some\(value=>String\(value\)\.toLowerCase\(\)\.includes\(query\)\)\)/);
  assert.doesNotMatch(main,/renderParkingSearchResults\(\)[^}]*endsWith\(query\)/);
});
