import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('/printpage는 검색부터 시작하고 모든 주차구역을 접은 인쇄 전용 화면을 제공한다',()=>{
  assert.match(main,/PRINT_MODE=location\.pathname==='\/printpage'\|\|location\.pathname==='\/printpage\/'/);
  assert.match(main,/main\?\.classList\.add\(VIEWER_MODE\?'viewer-page':'print-page'\)/);
  assert.match(main,/document\.querySelector\('\.topbar'\)\?\.remove\(\);document\.querySelector\('\.demo-banner'\)\?\.remove\(\);document\.querySelector\('\.section-head'\)\?\.remove\(\)/);
  assert.match(main,/expanded:PRINT_MODE\|\|viewerTower\|\|state\.expandedLayouts\.has\(zone\.id\)/);
  assert.match(css,/\.print-page\{padding-top:24px\}/);
  assert.match(css,/\.print-page \.zone-tabs,\.print-page \.workspace>\.no-result\{display:none\}/);
  assert.match(main,/expanded:PRINT_MODE\?false:options\.expanded/);
  assert.match(main,/if\(PRINT_MODE\)installPrintPageButton\(\)/);
  assert.match(main,/class="print-page-button"[\s\S]*?프린트[\s\S]*?onclick=\(\)=>window\.print\(\)/);
  assert.match(css,/\.print-page \.print-page-button\{[^}]*pointer-events:auto!important/);
  assert.match(css,/@page\{size:landscape;margin:8mm\}/);
  assert.match(css,/\.print-page \.parking-map,\.print-page \.zone-card\{margin:0 0 8mm;box-shadow:none\}/);
  assert.match(css,/\.print-page \.zones\.is-all\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)\}/);
  assert.match(css,/@media print\{\.print-page \.zones\.is-all\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:6mm\}/);
  assert.match(css,/data-map-zone="pillar11"\]\{grid-column:1!important;grid-row:1!important\}/);
  assert.match(css,/data-map-zone="b3"\]\{grid-column:1!important;grid-row:2!important\}/);
  assert.match(css,/data-map-zone="b5"\]\{grid-column:1!important;grid-row:3!important\}/);
  assert.match(css,/data-map-zone="roof"\]\{grid-column:2!important;grid-row:1\/span 2!important\}/);
  assert.match(css,/data-map-zone="tower"\]\{grid-column:2!important;grid-row:3!important\}/);
});
