import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeSheetDate,normalizeSheetDepartureDate,normalizeSheetPlate} from '../functions/_lib/google-sheets.js';

const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const sheets=readFileSync(new URL('../functions/_lib/google-sheets.js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('차량번호는 공백을 제거해 Google Sheet B열 key로 비교한다',()=>{
  assert.equal(normalizeSheetPlate(' 219 더 4124 '),'219더4124');
  assert.match(sheets,/plateRows\.get\(plate\)/);
  assert.match(sheets,/pending\.push\(\{action:'updated',row:existing\.row,sequence,values,record\}\)/);
});

test('기존 차량도 현황판 board_order를 스프레드시트 A열 순번으로 동기화한다',()=>{
  assert.match(sheets,/const sheetSequence=/);
  assert.match(sheets,/sheetSequence\(record,existing\.sequence/);
  assert.match(handler,/manager,board_order,memo,updated_at,/);
  assert.match(handler,/SELECT h\.\*,\(SELECT v\.board_order/);
});

test('K열 성능일자는 최신 D1 성능 기록을 yyyy.mm.dd 형식으로 동기화한다',()=>{
  assert.equal(normalizeSheetDate('2026-08-24'),'2026.08.24');
  assert.equal(normalizeSheetDate('2026-8-4 10:30:00'),'2026.08.04');
  assert.equal(normalizeSheetDate(''),'');
  assert.match(sheets,/normalizeSheetDate\(record\.performance_service_date\),false,false/);
  assert.match(handler,/performance_service_date FROM vehicles/);
  assert.match(handler,/performance_service_date FROM heydealer_records/);
});

test('신규 행은 직전 행 서식과 validation을 복사하고 현황판 순번을 기록한다',()=>{
  assert.match(sheets,/'PASTE_FORMAT','PASTE_DATA_VALIDATION'/);
  assert.match(sheets,/sheetSequence\(record,lastSequence\+1\)/);
  assert.match(sheets,/\[sequence,\.\.\.values\]/);
  assert.match(sheets,/normalizeSheetDate\(record\.performance_service_date\),false,false/);
  assert.match(sheets,/String\(record\.mileage\|\|''\)/);
  assert.match(sheets,/String\(record\.mileage\|\|''\),String\(record\.manager\|\|''\),String\(record\.options\|\|''\)/);
  assert.doesNotMatch(sheets,/String\(record\.memo\|\|''\)/);
  assert.match(sheets,/sheetRange\(tab\.title,'A:X'\)/);
  assert.match(sheets,/startColumnIndex:0,endColumnIndex:24/);
});

test('스프레드시트 T열에 탁송 출발 날짜와 시간을 24시간제로 기록한다',()=>{
  assert.equal(normalizeSheetDepartureDate('2026-09-04 (금) 오전 10시 출발예정'),'2026-09-04 10:00');
  assert.equal(normalizeSheetDepartureDate('2026. 9. 4. 오후 2시'),'2026-09-04 14:00');
  assert.equal(normalizeSheetDepartureDate('2026-09-04 (금) 18:30 출발예정'),'2026-09-04 18:30');
  assert.equal(normalizeSheetDepartureDate('오전 10시 출발예정'),'');
  assert.match(sheets,/normalizeSheetDepartureDate\(record\.departure_time\)/);
  assert.match(sheets,/`A\$\{row\}:T\$\{row\}`/);
  assert.match(sheets,/ensureSyncHeaders\(env,sheetId,tab\.title,rows\[0\]\|\|\[\]\)/);
  assert.match(sheets,/values:\[\['탁송출발지','탁송출발시간'\]\]/);
  assert.match(sheets,/String\(record\.origin\|\|''\),normalizeSheetDepartureDate\(record\.departure_time\)/);
});

test('W열 차대금과 X열 입금계좌를 쓰되 U/V열은 덮어쓰지 않는다',()=>{
  assert.match(sheets,/sheetRange\(tab,`W\$\{row\}:X\$\{row\}`\)/);
  assert.match(sheets,/String\(record\.price\|\|''\),String\(record\.account\|\|''\)/);
  assert.match(sheets,/sheetRange\(tab,'W1:X1'\)/);
  assert.match(sheets,/values:\[\['차대금','입금계좌'\]\]/);
  assert.match(sheets,/writeRecordBatch\(env,sheetId,tab\.title,batch\)/);
  assert.doesNotMatch(sheets,/`\$\{startColumn\}\$\{row\}:X\$\{row\}`/);
});

test('전체 동기화는 차량별 요청 대신 50대 단위 Sheets batchUpdate를 사용한다',()=>{
  assert.match(sheets,/values:batchUpdate/);
  assert.match(sheets,/index\+=50/);
  assert.match(sheets,/pending\.slice\(index,index\+50\)/);
});

test('Sheets API는 서버 전용 서비스계정 JWT와 Web Crypto를 사용한다',()=>{
  assert.match(sheets,/https:\/\/www\.googleapis\.com\/auth\/spreadsheets/);
  assert.match(sheets,/crypto\.subtle\.importKey\('pkcs8'/);
  assert.match(sheets,/replace\(\/\\\\n\/g,'\\n'\)/);
  assert.doesNotMatch(main,/GOOGLE_PRIVATE_KEY|GOOGLE_CLIENT_EMAIL/);
});

test('탭·테스트·개별·전체 동기화 API와 탭 선택 UI를 제공한다',()=>{
  assert.match(handler,/parts\[1\]==='tabs'/);
  assert.match(handler,/parts\[1\]==='test'/);
  assert.match(handler,/parts\[1\]==='sync-vehicle'/);
  assert.match(handler,/parts\[1\]==='sync-all'/);
  assert.match(main,/data-sheet-tab/);
  assert.match(main,/SHEET_TAB_STORAGE/);
  assert.match(main,/>저장<\/button>/);
  assert.match(main,/>전체 동기화<\/button>/);
  assert.match(handler,/SELECT plate,model,model_year,color,options,manager,board_order,memo,updated_at,/);
});

test('차량현황판 전체 탭 왼쪽에서 Sheets 전체 동기화를 실행한다',()=>{
  assert.match(main,/data-dashboard-sheet-sync/);
  assert.match(main,/data-dashboard-sheet-tab/);
  assert.match(main,/dashboardSyncButton\.onclick=async/);
  assert.match(main,/api\('google-sheets\/sync-all'/);
  assert.match(main,/data-dashboard-sync-label/);
  assert.match(main,/setDashboardSyncLabel\('전체동기화'\)/);
  assert.match(main,/dashboardSyncLabel\.innerHTML=`<span>동기화 중<\/span><i/);
  assert.match(main,/setDashboardSyncLabel\('',dots\)/);
});
