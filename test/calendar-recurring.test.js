import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recurringDate,nextCalendarMonth} from '../src/calendar-recurring.js';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/calendar-recurring.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('매월 고정일과 마지막 금요일을 해당 월 날짜로 계산한다',()=>{
  assert.equal(recurringDate('2026-09',{kind:'monthly-day',day:21}),'2026-09-21');
  assert.equal(recurringDate('2026-09',{kind:'last-friday'}),'2026-09-25');
  assert.equal(recurringDate('2026-02',{kind:'monthly-day',day:31}),'');
  assert.equal(recurringDate('2026-09',{kind:'monthly-weekday',week_ordinal:0,weekday:5}),'2026-09-25');
  assert.equal(recurringDate('2026-09',{kind:'monthly-weekday',week_ordinal:2,weekday:2}),'2026-09-08');
  assert.equal(nextCalendarMonth('2026-12'),'2027-01');
});

test('주말과 공휴일 일정은 직전 영업일로 당기고 월 경계를 넘을 수 있다',()=>{
  assert.equal(recurringDate('2026-10',{kind:'monthly-day',day:3,exclude_holidays:1}),'2026-10-02');
  assert.equal(recurringDate('2026-08',{kind:'monthly-day',day:1,exclude_holidays:1}),'2026-07-31');
  assert.equal(recurringDate('2026-09',{kind:'monthly-day',day:25,exclude_holidays:1}),'2026-09-23');
  assert.equal(recurringDate('2026-10',{kind:'monthly-day',day:5,exclude_holidays:1}),'2026-10-02');
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
  assert.match(ui,/name="excludeHolidays"/);
  assert.match(ui,/\['all','전체'\],\['vehicles','입고예정차량'\],\['todos','To do list'\],\['recurring','반복일정'\]/);
  assert.match(css,/\.calendar-recurring-item\{[^}]*border:1px solid #b52b25/);
  assert.match(css,/\.calendar-filters\{top:212px\}/);
});
