import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recurringDate,recurringOccurrences,recurringMoveLabel,nextCalendarMonth} from '../src/calendar-recurring.js';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/calendar-recurring.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('매월 고정일과 마지막 금요일을 해당 월 날짜로 계산한다',()=>{
  assert.equal(recurringDate('2026-09',{kind:'monthly-day',day:21}),'2026-09-21');
  assert.equal(recurringDate('2026-09',{kind:'last-friday'}),'2026-09-25');
  assert.equal(recurringDate('2026-02',{kind:'monthly-day',day:31}),'2026-02-28');
  assert.equal(recurringDate('2028-02',{kind:'monthly-day',day:31}),'2028-02-29');
  assert.equal(recurringDate('2026-04',{kind:'monthly-day',day:31}),'2026-04-30');
  assert.equal(recurringDate('2026-09',{kind:'monthly-weekday',week_ordinal:0,weekday:5}),'2026-09-25');
  assert.equal(recurringDate('2026-09',{kind:'monthly-weekday',week_ordinal:2,weekday:2}),'2026-09-08');
  assert.equal(nextCalendarMonth('2026-12'),'2027-01');
});

test('주말과 공휴일 일정은 직전 영업일로 당기고 월 경계를 넘을 수 있다',()=>{
  assert.equal(recurringDate('2026-10',{kind:'monthly-day',day:3,exclude_holidays:1}),'2026-10-02');
  assert.equal(recurringDate('2026-08',{kind:'monthly-day',day:1,exclude_holidays:1}),'2026-07-31');
  assert.equal(recurringDate('2026-09',{kind:'monthly-day',day:25,exclude_holidays:1}),'2026-09-23');
  assert.equal(recurringDate('2026-10',{kind:'monthly-day',day:5,exclude_holidays:1}),'2026-10-02');
  assert.deepEqual(recurringOccurrences('2026-10',{kind:'monthly-day',day:3,exclude_holidays:1}),[{date:'2026-10-02',original:false},{date:'2026-10-03',original:true}]);
  assert.deepEqual(recurringOccurrences('2026-10',{kind:'monthly-day',day:2,exclude_holidays:1}),[{date:'2026-10-02',original:false}]);
  assert.deepEqual(recurringOccurrences('2026-08',{kind:'monthly-day',day:1,exclude_holidays:1}),[{date:'2026-07-31',original:false},{date:'2026-08-01',original:true}]);
  assert.equal(recurringMoveLabel('2026-10',{kind:'monthly-day',day:3,exclude_holidays:1}),'(02일로 이동)');
  assert.equal(recurringMoveLabel('2026-10',{kind:'monthly-day',day:2,exclude_holidays:1}),'');
});

test('반복일정을 저장하고 캘린더 분류 필터와 빨간색 스타일로 표시한다',()=>{
  assert.match(api,/parts\[0\]==='calendar-recurring'/);
  assert.match(api,/INSERT INTO calendar_recurring/);
  assert.match(api,/UPDATE calendar_recurring/);
  assert.match(api,/exclude_holidays/);
  assert.match(api,/DELETE FROM calendar_recurring/);
  assert.match(main,/installRecurringCalendarUI\(\{api,esc\}\)/);
  assert.match(ui,/\+ 반복일정추가/);
  assert.match(ui,/class="recurring-segments"/);
  assert.doesNotMatch(ui,/class="recurring-field-title"/);
  assert.match(ui,/name="weekOrdinal" aria-label="주차 선택"/);
  assert.match(ui,/\[1,2,3,4,0\]\.map/);
  assert.doesNotMatch(ui,/\[1,2,3,4,5,0\]/);
  assert.match(ui,/\$\{value\}번째 주/);
  assert.match(ui,/name="weekday" aria-label="요일 선택"/);
  assert.match(ui,/type="number" name="day" aria-label="날짜 입력" min="1" max="31"/);
  assert.match(ui,/<span aria-hidden="true">일<\/span>/);
  assert.doesNotMatch(ui,/data-recurring-week>주차|data-recurring-weekday>요일/);
  assert.match(ui,/name="excludeHolidays"/);
  assert.match(ui,/\['all','전체'\],\['vehicles','입고예정차량'\],\['todos','To do list'\],\['recurring','반복일정'\]/);
  assert.match(css,/\.calendar-recurring-item\{[^}]*border:1px solid #b52b25/);
  assert.match(css,/\.calendar-recurring-item\.is-original\{[^}]*background:#f0f1f1;color:#c82020/);
  assert.match(ui,/move\.textContent=recurringMoveLabel\(sourceMonth,rule\)/);
  assert.match(css,/\.calendar-recurring-item\.is-original>small\{[^}]*color:#c82020/);
  assert.match(css,/\.calendar-filters\{top:212px\}/);
  assert.match(css,/\.calendar-recurring-modal \.recurring-rule-fields select\{height:54px;padding:10px 12px;font-size:17px/);
  assert.match(css,/\.calendar-recurring-modal \.recurring-day-input>span\{padding-right:12px/);
  assert.match(css,/\.recurring-exclude:has\(input:checked\)\{color:#b52b25\}/);
});
