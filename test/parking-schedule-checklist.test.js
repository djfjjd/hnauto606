import test from'node:test';
import assert from'node:assert/strict';
import fs from'node:fs';

const main=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=fs.readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=fs.readFileSync(new URL('../migrations/0018_add_calendar_completion.sql',import.meta.url),'utf8');

test('첫 화면 일정 관리 패널은 추가/완료 일정을 두 행으로 나눈다',()=>{
  assert.match(main,/parking-schedule-checklist/);
  assert.match(main,/<strong>추가된 일정 \(\$\{pending\.length\}대\)<\/strong>/);
  assert.match(main,/>완료일정</);
  assert.match(main,/data-parking-schedule-review>\$\{reviewCount\}대 확인필요 →<\/button>/);
  assert.match(main,/parkingScheduleNeedsReview=record=>record\.customer_type==='확인중'\|\|\/탁송/);
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
  assert.match(main,/body:JSON\.stringify\(\{completed\}\)/);
});

test('왼쪽 일정 차량번호는 기존 캘린더 차량 상세 팝업을 연다',()=>{
  assert.match(main,/data-parking-schedule-record/);
  assert.match(main,/<b>\$\{esc\(record\.plate\)\|\|'차량번호 미입력'\}<\/b><span>\$\{esc\(record\.manager\)\|\|'미지정'\}<\/span>/);
  assert.match(main,/parkingScheduleModelLabel=model=>\{const words=String\(model\|\|'차종 미입력'\)\.trim\(\)\.split\(\/\\s\+\/\);return words\.slice\(0,words\[1\]\?\.length===1\?3:2\)\.join\(' '\);\}/);
  assert.match(main,/esc\(parkingScheduleModelLabel\(record\.model\)\)/);
  assert.match(css,/parking-schedule-check-plate\{[^}]*display:flex[^}]*gap:6px/);
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
