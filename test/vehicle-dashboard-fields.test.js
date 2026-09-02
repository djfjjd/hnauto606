import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0015_add_vehicle_dashboard_fields.sql',import.meta.url),'utf8');

test('차량 현황판에 km와 상품화 작업 체크 열을 순서대로 표시한다',()=>{
  assert.match(main,/\['performance','성능'\],\['polishing','광택'\],\['advertising','광고'\],\['performanceDate','성능일자'\],\['underbody','하부'\],\['bodywork','판금'\],\['dent','덴트'\],\['repair','수리'\]/);
  assert.match(main,/<span>연식<\/span><span>총 주행키로수<\/span><span>색상<\/span><span>입고일<\/span><span>옵션<\/span>/);
  assert.match(main,/type="checkbox" data-board-check=/);
  assert.match(main,/esc\(s\.mileage\)\|\|'-'/);
  assert.match(css,/\.board-row\{width:100%;min-width:1540px/);
  assert.match(main,/class="board-option-cell"><span class="board-option-text">\$\{esc\(s\.options\)\|\|'-'\}<\/span>\$\{actions\}<\/span>/);
  assert.match(css,/\.board-option-cell\{position:sticky;right:0;[^}]*display:flex/);
  assert.match(css,/\.board-option-cell\{[^}]*background:transparent;box-shadow:none/);
  assert.match(css,/repeat\(7,58px\) minmax\(58px,1fr\)/);
  assert.match(css,/\.board-row\{width:100%;min-width:1540px;padding-right:0/);
});

test('현황판 체크 상태와 주행거리를 D1에 보존한다',()=>{
  assert.match(migration,/ADD COLUMN mileage TEXT NOT NULL DEFAULT ''/);
  for(const column of ['performance_checked','polishing_checked','advertising_checked','performance_date_checked','underbody_checked','bodywork_checked','dent_checked','repair_checked'])assert.match(migration,new RegExp(`ADD COLUMN ${column} INTEGER NOT NULL DEFAULT 0`));
  assert.match(handler,/parts\[2\]==='board-check'/);
  assert.match(handler,/UPDATE vehicles SET \$\{column\}=\?,version=version\+1/);
  assert.match(main,/api\(`vehicles\/\$\{vehicle\.vehicleId\|\|vehicle\.id\}\/board-check`/);
  assert.match(main,/mileage:f\.get\('mileage'\)/);
});
