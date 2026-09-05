import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizePolishingVendor,normalizeRepairDescription,normalizeServiceDescription,normalizeSheetDate,normalizeSheetDepartureDate,normalizeSheetMileage,normalizeSheetPlate} from '../functions/_lib/google-sheets.js';

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
  assert.match(handler,/manager,board_order,memo,performance_checked,polishing_checked,advertising_checked/);
  assert.match(handler,/SELECT h\.\*,\(SELECT v\.board_order/);
  assert.match(sheets,/normalizeSheetPlate\(record\.plate\)==='59다3609'\)return 0/);
  assert.match(handler,/function applyDashboardSheetSequences\(records\)/);
  assert.match(handler,/const groups=new Map\(\)/);
  assert.match(handler,/record\.board_order=isPinnedSheetVehicle\(record\)\?0:index\+\(hasPinned\?0:1\)/);
  assert.match(handler,/applyDashboardSheetSequences\(latest\);const result=/);
});

test('L열 성능일자는 조건부 수식이 계산할 수 있는 Sheets 숫자형 날짜로 동기화한다',()=>{
  const august24=normalizeSheetDate('2026-08-24'),august25=normalizeSheetDate('2026-08-25');
  assert.equal(typeof august24,'number');
  assert.equal(august25-august24,1);
  assert.equal(normalizeSheetDate('2026-8-4 10:30:00'),normalizeSheetDate('2026-08-04'));
  assert.equal(normalizeSheetDate(''),'');
  assert.match(sheets,/normalizeSheetDate\(record\.performance_service_date\),normalizePolishingVendor\(record\.polishing_note\)\|\|Boolean\(record\.polishing_checked\),Boolean\(record\.advertising_checked\)/);
  assert.match(handler,/performance_service_date,\(SELECT started_at.*reperformance_service_date/);
  assert.match(handler,/performance_service_date FROM heydealer_records/);
  assert.match(handler,/COALESCE\(\(SELECT sr\.started_at/);
  assert.match(handler,/,checked_in_at\) performance_service_date/);
});

test('M열 광택은 체크값 대신 최신 작업 업체명 스타 또는 신화로 동기화한다',()=>{
  assert.equal(normalizePolishingVendor('[광택] 스타'),'스타');
  assert.equal(normalizePolishingVendor('[광택] 신화'),'신화');
  assert.equal(normalizePolishingVendor('[광택] 기타'),'');
  assert.match(handler,/LIKE '\[광택\]%'/);
  assert.match(handler,/\) polishing_note,\(SELECT note.*bodywork_note/);
});

test('신규 행은 직전 행 서식과 validation을 복사하고 현황판 순번을 기록한다',()=>{
  assert.match(sheets,/'PASTE_FORMAT','PASTE_DATA_VALIDATION'/);
  assert.match(sheets,/sheetSequence\(record,lastSequence\+1\)/);
  assert.match(sheets,/\[sequence,\.\.\.values\]/);
  assert.match(sheets,/normalizeSheetDate\(record\.performance_service_date\),normalizePolishingVendor\(record\.polishing_note\)\|\|Boolean\(record\.polishing_checked\)/);
  assert.match(sheets,/normalizeSheetMileage\(record\.mileage\)/);
  assert.match(sheets,/normalizeSheetMileage\(record\.mileage\),String\(record\.manager\|\|''\),String\(record\.options\|\|''\)/);
  assert.doesNotMatch(sheets,/String\(record\.memo\|\|''\)/);
  assert.match(sheets,/sheetRange\(tab\.title,'A:Z'\)/);
  assert.match(sheets,/startColumnIndex:0,endColumnIndex:26/);
});

test('G열 총 주행거리는 콤마와 km 단위를 제거한 숫자값으로 동기화한다',()=>{
  assert.equal(normalizeSheetMileage('18,634km'),18634);
  assert.equal(normalizeSheetMileage('23451'),23451);
  assert.equal(normalizeSheetMileage(''),'');
  assert.match(sheets,/sheetRange\(tab,`G\$\{row\}`\)/);
  assert.match(sheets,/values:\[\[normalizeSheetMileage\(record\.mileage\)\]\]/);
  assert.match(sheets,/valueInputOption:'RAW',data/);
  assert.match(sheets,/writeVerifiedNumericBatch\(env,sheetId,mileageData,'총 주행거리 G열'\)/);
  assert.match(sheets,/writeVerifiedNumericBatch\(env,sheetId,sequenceData,'순번 A열'\)/);
  assert.match(sheets,/mileageUpdated\+=verified\.mileageUpdated/);
  assert.match(handler,/mileageUpdated:result\.mileageUpdated/);
  assert.match(handler,/sequenceUpdated:result\.sequenceUpdated/);
  assert.match(handler,/vehicleSheetFields="id,plate,model,model_year,mileage,color,options/);
});

test('차량현황판 수리내용을 스프레드시트 R열에 동기화한다',()=>{
  assert.equal(normalizeRepairDescription('[카센터] 엔진오일 교환 · 비용 신평카'),'엔진오일 교환 (신평카)');
  assert.equal(normalizeRepairDescription('[카센터(기타)] 타이어 교체'),'타이어 교체');
  assert.match(sheets,/normalizeRepairDescription\(record\.repair_note\)/);
  assert.match(handler,/vehicleSheetFields=.*repair_note/);
  assert.match(handler,/sync-vehicle.*repair_note/);
});

test('차량현황 작업 항목과 상태 변경을 Sheets L:S열에 동기화한다',()=>{
  assert.equal(normalizeServiceDescription('[판금] 운전석 도어','판금'),'운전석 도어');
  assert.equal(normalizeServiceDescription('[덴트] 조수석 펜더','덴트'),'조수석 펜더');
  assert.match(sheets,/const boardHeaders=\['성능','광택','광고','재성능','하부','판금','수리','덴트'\]/);
  assert.match(sheets,/normalizeSheetDate\(record\.reperformance_service_date\)\|\|Boolean\(record\.performance_date_checked\)/);
  assert.match(sheets,/Boolean\(record\.underbody_checked\)/);
  assert.match(sheets,/normalizeServiceDescription\(record\.bodywork_note,'판금'\)\|\|Boolean\(record\.bodywork_checked\)/);
  assert.match(sheets,/normalizeServiceDescription\(record\.dent_note,'덴트'\)\|\|Boolean\(record\.dent_checked\)/);
  assert.match(handler,/queueVehicleSheetSync\(context,user,\[vehicle\.id\],`board-check:\$\{input\.field\}`\)/);
  assert.match(handler,/queueVehicleSheetSync\(context,user,\[vehicle\.id\],'check-out'\)/);
  assert.match(handler,/SELECT \$\{vehicleSheetFields\} FROM vehicles ORDER BY updated_at DESC/);
  assert.match(handler,/if\(!ids\.length\)return/);
  assert.doesNotMatch(handler,/records\.length\)return;applyDashboardSheetSequences\(records\)/);
});

test('스프레드시트 U열에 탁송 출발 날짜와 시간을 24시간제로 기록한다',()=>{
  assert.equal(normalizeSheetDepartureDate('2026-09-04 (금) 오전 10시 출발예정'),'2026-09-04 10:00');
  assert.equal(normalizeSheetDepartureDate('2026. 9. 4. 오후 2시'),'2026-09-04 14:00');
  assert.equal(normalizeSheetDepartureDate('2026-09-04 (금) 18:30 출발예정'),'2026-09-04 18:30');
  assert.equal(normalizeSheetDepartureDate('오전 10시 출발예정'),'');
  assert.match(sheets,/normalizeSheetDepartureDate\(record\.departure_time\)/);
  assert.match(sheets,/`A\$\{row\}:U\$\{row\}`/);
  assert.match(sheets,/ensureSyncHeaders\(env,sheetId,tab\.title,rows\[0\]\|\|\[\]\)/);
  assert.match(sheets,/values:\[\['탁송출발지','탁송출발시간'\]\]/);
  assert.match(sheets,/String\(record\.origin\|\|''\),normalizeSheetDepartureDate\(record\.departure_time\)/);
});

test('X열 차대금, Y열 입금계좌, Z열 판매 여부를 쓰되 V/W열은 덮어쓰지 않는다',()=>{
  assert.match(sheets,/sheetRange\(tab,`X\$\{row\}:Z\$\{row\}`\)/);
  assert.match(sheets,/String\(record\.price\|\|''\),String\(record\.account\|\|''\),Boolean\(record\.checked_out_at\)/);
  assert.match(sheets,/sheetRange\(tab,'X1:Z1'\)/);
  assert.match(sheets,/values:\[\['차대금','입금계좌','판매됨'\]\]/);
  assert.match(sheets,/writeRecordBatch\(env,sheetId,tab\.title,batch\)/);
  assert.doesNotMatch(sheets,/`\$\{startColumn\}\$\{row\}:X\$\{row\}`/);
});

test('개별 및 전체 동기화가 출고일을 조회해 Z열 판매됨을 boolean으로 기록한다',()=>{
  assert.match(handler,/\) checked_out_at,\(SELECT sr\.note/);
  assert.match(handler,/repair_checked,checked_in_at,checked_out_at,updated_at/);
});

test('K열 입출고일은 출고일을 우선하고 판매 중 차량은 입고일을 사용한다',()=>{
  assert.match(sheets,/normalizeSheetDate\(record\.checked_out_at\|\|record\.checked_in_at\|\|record\.record_date\)/);
  assert.match(sheets,/sheetRange\(tab,'K1'\)/);
  assert.match(sheets,/values:\[\['입,출고일'\]\]/);
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
  assert.match(handler,/SELECT \$\{vehicleSheetFields\} FROM vehicles ORDER BY updated_at DESC/);
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
