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
  assert.match(main,/PRINT_PAGE_TITLE='\(주\)하나오토 주차현황 인쇄';\s*if\(PRINT_MODE\)document\.title=PRINT_PAGE_TITLE/);
  assert.match(main,/const printWindow=window\.open\('','hana-auto-parking-print','popup'\)/);
  assert.match(main,/filter\(node=>node\.tagName!=='SCRIPT'&&node\.tagName!=='TITLE'\)/);
  assert.match(main,/<title>\$\{PRINT_PAGE_TITLE\}<\/title>/);
  assert.match(main,/await printWindow\.document\.fonts\?\.ready;await Promise\.all\(\[\.\.\.printWindow\.document\.images\]/);
  assert.match(main,/printWindow\.document\.title=PRINT_PAGE_TITLE;printWindow\.focus\(\);printWindow\.print\(\)/);
  assert.match(main,/if\(!printWindow\)\{window\.focus\(\);window\.print\(\);return;\}/);
  assert.match(main,/class="print-page-button"[\s\S]*?프린트[\s\S]*?event\.preventDefault\(\);event\.stopPropagation\(\);printParkingPage\(\)/);
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
  assert.match(css,/\.print-page \.parking-cell,\.print-page \.parking-special,\.print-page \.spot\{color:#111!important;background:#fff!important\}/);
  assert.match(css,/\.print-page \.zones,\.print-page \.zones \*\{color:#111!important;text-shadow:none!important\}/);
  assert.match(css,/@media print\{\.print-page \.parking-map\{min-width:0;overflow:hidden;box-sizing:border-box\}/);
  assert.match(css,/\.print-page \.parking-map-grid\{width:100%;max-width:100%;grid-template-columns:var\(--row-label-width,20px\) repeat\(var\(--map-columns\),minmax\(0,1fr\)\)\}/);
  assert.match(css,/\.print-page \.parking-map-grid\.has-no-row-label\{grid-template-columns:repeat\(var\(--map-columns\),minmax\(0,1fr\)\)\}/);
  assert.match(css,/@media print\{\.print-page\{zoom:74%\}\}/);
});

test('인쇄 페이지는 새싹타워 자리에 절반 높이의 미배정·출고예정 목록을 표시한다',()=>{
  assert.match(main,/function installPrintStatusLayouts\(\)/);
  assert.match(main,/className='zone-card service product-checked-out'/);
  assert.match(main,/parkedDepartures=state\.spots\.filter\(vehicle=>used\(vehicle\)&&\(vehicle\.isCheckedOut\|\|vehicle\.isContracted\)&&!vehicle\.isUnassigned\)/);
  assert.match(main,/parkedDepartures\.map\(spot\)\.join\(''\)/);
  assert.match(main,/stack\.append\(unassigned,departures\)/);
  assert.match(css,/\.print-page \.parking-map\[data-map-zone="tower"\]\{display:none!important\}\.print-page \.print-status-stack\{grid-column:2!important;grid-row:3!important;display:grid;grid-template-rows:repeat\(2,minmax\(0,1fr\)\);align-self:stretch;contain:size/);
  assert.match(css,/\.print-page \.print-status-stack>\.zone-card\{min-height:0;margin:0;padding:7px;overflow:hidden\}/);
  assert.match(css,/\.print-page \.print-status-stack \.spot\{min-height:46px;padding:5px\}/);
});

test('인쇄 페이지의 계약·출고 차량은 차종 왼쪽에 상태를 표시한다',()=>{
  assert.match(main,/printStatus=PRINT_MODE\?\(s\.isContracted\?'\(계약됨\) ':s\.isCheckedOut\?'\(출고됨\) ':''\):''/);
  assert.match(main,/`\$\{printStatus\}\$\{s\.model\} · \$\{s\.color\}`/);
  assert.match(css,/\.print-page \.parking-cell\[data-print-status\] span:not\(\.parking-alert-icons\)::before\{content:"\(" attr\(data-print-status\) "\) "/);
});
