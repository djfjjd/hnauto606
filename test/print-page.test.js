import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('/printpage는 검색부터 시작하고 모든 주차구역을 접은 인쇄 전용 화면을 제공한다',()=>{
  assert.match(main,/PRINT_MODE=location\.pathname==='\/printpage'\|\|location\.pathname==='\/printpage\/'/);
  assert.match(main,/if\(!await ensureDeviceAccess\(\)\)return;if\(PRINT_MODE\)\{await loadViewer\(\);return;\}/);
  assert.match(main,/main\?\.classList\.add\(VIEWER_MODE\?'viewer-page':'print-page'\)/);
  assert.match(main,/document\.querySelector\('\.topbar'\)\?\.remove\(\);document\.querySelector\('\.demo-banner'\)\?\.remove\(\);document\.querySelector\('\.section-head'\)\?\.remove\(\)/);
  assert.match(main,/expanded:PRINT_MODE\|\|viewerTower\|\|state\.expandedLayouts\.has\(zone\.id\)/);
  assert.match(css,/\.print-page\{padding-top:24px\}/);
  assert.match(css,/\.print-page \.zone-tabs,\.print-page \.workspace>\.no-result\{display:none\}/);
  assert.match(main,/const expanded=PRINT_MODE\?false:options\.expanded/);
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
  assert.match(css,/\.print-page \.parking-map\[data-map-zone="tower"\] \.parking-map-head h2\{display:none\}/);
  assert.match(css,/@media print\{\.print-page \.parking-map\{min-width:0;overflow:hidden;box-sizing:border-box\}/);
  assert.match(css,/\.print-page \.parking-map-grid\{width:100%;max-width:100%;grid-template-columns:var\(--row-label-width,20px\) repeat\(var\(--map-columns\),minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.print-page \.parking-map-grid\.has-no-row-label\{grid-template-columns:repeat\(var\(--map-columns\),minmax\(0,1fr\)\)\}/);
  assert.match(css,/@media print\{\.print-page\{zoom:74%\}\}/);
});

test('인쇄 페이지는 새싹타워를 숨기고 그 자리에 주차구역 미배정을 표시한다',()=>{
  assert.match(css,/\.print-page \.parking-map\[data-map-zone="tower"\]\{display:none!important\}\.print-page \.zones\.is-all>\.product-unassigned\{grid-column:4\/span 3;grid-row:3;margin:0\}/);
});
