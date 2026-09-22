import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recurringDate} from '../src/calendar-recurring.js';

const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/calendar-recurring.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('매월 고정일과 마지막 금요일을 해당 월 날짜로 계산한다',()=>{
  assert.equal(recurringDate('2026-09',{kind:'monthly-day',day:21}),'2026-09-21');
  assert.equal(recurringDate('2026-09',{kind:'last-friday'}),'2026-09-25');
  assert.equal(recurringDate('2026-02',{kind:'monthly-day',day:31}),'');
});

test('반복일정을 저장하고 캘린더 분류 필터와 빨간색 스타일로 표시한다',()=>{
  assert.match(api,/parts\[0\]==='calendar-recurring'/);
  assert.match(api,/INSERT INTO calendar_recurring/);
  assert.match(api,/UPDATE calendar_recurring/);
  assert.match(api,/DELETE FROM calendar_recurring/);
  assert.match(main,/installRecurringCalendarUI\(\{api,esc\}\)/);
  assert.match(ui,/\+ 반복일정추가/);
  assert.match(ui,/\['all','전체'\],\['vehicles','입고예정차량'\],\['todos','To do list'\],\['recurring','반복일정'\]/);
  assert.match(css,/\.calendar-recurring-item\{[^}]*border:1px solid #b52b25/);
});
