import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../migrations/0018_add_calendar_completion.sql',import.meta.url),'utf8');

test('첫 화면 일정 관리 패널은 추가/완료 일정을 두 행으로 나눈다',()=>{
  assert.match(main,/state\.calendarRecords\.filter\(record=>heydealerScheduleDate\(record\)\|\|heydealerSchedulePending\(record\)\)/);
  assert.match(main,/heydealerScheduleDate\(a\)\|\|'0000-00-00'/);
  assert.match(main,/parking-schedule-checklist/);
  assert.match(main,/<strong>추가된 일정 \(\$\{pending\.length\}대\)<\/strong>/);
  assert.match(main,/>완료일정</);
  assert.match(main,/data-parking-schedule-review>\$\{reviewCount\}대 점검필요 →<\/button>/);
  assert.match(main,/parkingScheduleNeedsReview=record=>record\.customer_type==='확인중'\|\|\/탁송/);
  assert.match(main,/<h2 id="parking-schedule-review-title">점검 필요 차량<\/h2>/);
  assert.match(main,/점검 필요한 차량이 없습니다\./);
  assert.match(main,/!done&&parkingScheduleNeedsReview\(record\)\?'<i class="parking-schedule-review-mark" aria-label="점검 필요" title="점검 필요">!<\/i>'/);
  assert.match(css,/\.parking-schedule-review-mark\{[^}]*color:#ffcf66/);
  assert.match(css,/@media\(max-width:800px\)\{[\s\S]*?\.parking-schedule-check-plate:has\(\.parking-schedule-review-mark\) b\{color:#ffcf66\}\.parking-schedule-review-mark\{display:none\}/);
  assert.match(main,/function openParkingScheduleReview\(\)/);
  assert.match(main,/법인유무 확인중/);
  assert.match(main,/탁송일정 확인중/);
  assert.match(main,/addEventListener\('click',openParkingScheduleReview\)/);
  assert.match(css,/\.parking-schedule-review-modal\{/);
  assert.match(css,/grid-template-rows:1fr 1fr/);
  assert.match(css,/parking-schedule-checklist section>strong\{[^}]*font-size:15px/);
  assert.match(css,/parking-schedule-check-plate\{[^}]*font-size:16px/);
  assert.match(css,/parking-schedule-check-item small\{font-size:14px/);
});

test('개인과 법인 일정 표시는 구분되고 체크 상태를 되돌릴 수 있다',()=>{
  assert.match(main,/record\.customer_type==='확인중'\?'\(확인중\)'/);
  assert.match(main,/record\.customer_type==='확인중'\?'is-pending'/);
  assert.match(css,/\.parking-schedule-check-item small\.is-pending\{color:#5ca9ff\}/);
  assert.match(css,/small\.is-corporate\{color:#ff6666\}/);
  assert.match(css,/small\.is-personal\{color:#aeb7b1\}/);
  assert.match(main,/body:JSON\.stringify\(\{completed:false,rollbackCheckIn:true\}\)/);
});

test('추가된 일정을 체크하면 해당 차량을 신규 입고 등록하고 완료일정으로 이동한다',()=>{
  assert.match(main,/const parkingScheduleCheckInPayload=record=>\(\{heydealerRecordId:record\.id,plate:record\.plate,model:record\.model,modelYear:record\.model_year/);
  assert.match(main,/if\(completed\)\{if\(!record\)throw new Error\('신규 입고로 등록할 일정을 찾을 수 없습니다\.'\);const result=await api\('vehicles\/check-in',\{method:'POST',body:JSON\.stringify\(parkingScheduleCheckInPayload\(record\)\)\}\)/);
  assert.match(main,/record\.calendar_completed_at=new Date\(\)\.toISOString\(\);await refresh\(result\.message\)/);
});

test('완료일정 체크 해제는 일정에서 만든 미변경 신규 입고 차량을 함께 되돌린다',()=>{
  assert.match(api,/json_extract\(a\.details_json,'\$\.heydealerRecordId'\)=\?/);
  assert.match(api,/Number\(vehicle\.version\)===0&&Number\(vehicle\.movement_count\)===1/);
  assert.match(api,/DELETE FROM vehicles WHERE id=\? AND version=0 AND current_spot_id IS NULL AND checked_out_at IS NULL/);
  assert.match(api,/rollback_schedule_check_in/);
  assert.match(main,/completed:false,rollbackCheckIn:true/);
  assert.match(main,/await refresh\(result\.message\)/);
});

test('왼쪽 일정 차량번호는 기존 캘린더 차량 상세 팝업을 연다',()=>{
  assert.match(main,/data-parking-schedule-record/);
  assert.match(main,/<b>\$\{esc\(record\.plate\)\|\|'차량번호 미입력'\}<\/b><span>\$\{esc\(record\.manager\)\|\|'미지정'\}<\/span>/);
  assert.match(main,/parkingScheduleModelLabel=model=>\{const words=String\(model\|\|'차종 미입력'\)\.trim\(\)\.split\(\/\\s\+\/\),wordCount=words\[1\]\?\.length===1\?\(words\[2\]\?\.length===1\?4:3\):2;return words\.slice\(0,wordCount\)\.join\(' '\);\}/);
  assert.match(main,/esc\(parkingScheduleModelLabel\(record\.model\)\)/);
  assert.match(css,/parking-schedule-check-plate\{[^}]*display:flex[^}]*gap:6px/);
  assert.match(css,/@media\(max-width:800px\)\{[^}]*parking-schedule-checklist[\s\S]*?\.parking-schedule-check-plate span:last-of-type\{display:none\}/);
  assert.match(main,/if\(record\)openCalendarRecord\(record\)/);
  assert.match(css,/parking-schedule-check-plate:hover/);
});

test('미니 캘린더 오늘 날짜에는 테두리를 표시한다',()=>{
  assert.match(css,/parking-mini-day\.is-today\{border:1px solid var\(--lime\);border-radius:7px\}/);
});

test('일정 완료 상태를 DB에 저장하고 API로 변경한다',()=>{
  assert.match(migration,/ADD COLUMN calendar_completed_at TEXT/);
  assert.match(api,/calendar-completion/);
  assert.match(api,/calendar_completed_at=\?/);
});
