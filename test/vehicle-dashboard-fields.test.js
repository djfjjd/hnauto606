import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0015_add_vehicle_dashboard_fields.sql',import.meta.url),'utf8');

test('차량 현황판에 성능·재성능·하부·덴트·판금·광택·수리 순서로 표시한다',()=>{
  assert.match(main,/\['performance','성능','date'\],\['performanceDate','재성능','check'\],\['underbody','하부','check'\],\['dent','덴트','check'\],\['bodywork','판금','count'\],\['polishing','광택','vendor'\],\['repair','수리','note'\]/);
  assert.match(main,/<span>연식<\/span><span>총 주행거리<\/span><span>색상<\/span><span>입고일<\/span><span>옵션<\/span>/);
  assert.match(main,/type="checkbox" data-board-check=/);
  assert.match(main,/class="board-service-date"/);
  assert.match(main,/class="board-polishing-vendor"/);
  assert.match(main,/class="board-bodywork-count"/);
  assert.match(main,/class="board-repair-note /);
  assert.match(main,/board-repair-note \$\{note\?'':'is-empty'\}/);
  assert.match(main,/polishingVendor:String\(s\.polishing_note/);
  assert.match(main,/const bodyworkCount=note=>/);
  assert.match(main,/const repairDescription=note=>/);
  assert.match(handler,/performance_service_date/);
  assert.match(handler,/COALESCE\(\(SELECT started_at FROM service_records sr WHERE sr\.vehicle_id=v\.id AND sr\.note LIKE '\[성능\]%'/);
  assert.match(handler,/v\.checked_in_at\) performance_service_date/);
  assert.match(handler,/polishing_note/);
  assert.match(handler,/bodywork_note/);
  assert.match(handler,/repair_note/);
  assert.match(main,/const formatMileage=value=>/);
  assert.match(main,/<span>\$\{formatMileage\(s\.mileage\)\}<\/span>/);
  assert.match(css,/\.board-row\{width:100%;min-width:1620px/);
  assert.match(main,/class="board-option-cell"><span class="board-option-text">\$\{esc\(s\.options\)\|\|'-'\}<\/span>\$\{actions\}<\/span>/);
  assert.match(css,/\.board-option-cell\{position:relative;[^}]*display:flex/);
  assert.match(css,/\.board-row\.is-checked-out \.board-option-cell\{position:sticky;right:0/);
  assert.match(css,/\.board-option-cell\{[^}]*background:transparent;box-shadow:none/);
  assert.match(css,/repeat\(6,58px\) minmax\(180px,1fr\)/);
  assert.match(css,/\.board-row>:last-child\{width:100%;justify-self:stretch\}/);
  assert.match(css,/\.board-row:not\(\.board-labels\) \.board-repair-note\{padding-left:24px\}/);
  assert.match(css,/\.board-repair-note\.is-empty\{padding-left:0;text-align:center\}/);
  assert.match(css,/\.board-row\{width:100%;min-width:1620px;padding-right:0/);
  assert.match(css,/\.board-labels>span:nth-child\(9\)\{padding:6px 8px\}/);
  assert.doesNotMatch(css,/\.board-labels>span:nth-child\(9\)\{[^}]*position:sticky/);
  assert.match(css,/\.board-row>strong,\.board-labels>span:nth-child\(3\)\{position:sticky;left:0/);
  assert.match(css,/\.board-row\.is-checked-out>strong\{background:#fff8f8\}/);
  assert.match(css,/\.board-row\.is-checked-out>strong::after\{/);
  assert.match(css,/border-right:1px solid #d9ded9;background:#fff/);
});

test('현황판 체크 상태와 주행거리를 D1에 보존한다',()=>{
  assert.match(migration,/ADD COLUMN mileage TEXT NOT NULL DEFAULT ''/);
  for(const column of ['performance_checked','polishing_checked','advertising_checked','performance_date_checked','underbody_checked','bodywork_checked','dent_checked','repair_checked'])assert.match(migration,new RegExp(`ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`));
  assert.match(handler,/parts\[2\]==='board-check'/);
  assert.match(handler,/UPDATE vehicles SET \$\{column\}=\?,version=version\+1/);
  assert.match(main,/api\(`vehicles\/\$\{vehicle\.vehicleId\|\|vehicle\.id\}\/board-check`/);
  assert.match(main,/mileage:f\.get\('mileage'\)/);
});
