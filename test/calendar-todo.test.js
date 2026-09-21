import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCalendarTodoPrompt} from '../src/calendar-todo.js';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0023_add_calendar_todos.sql',import.meta.url),'utf8');

test('일정 프롬프트에서 날짜와 내용을 자동 분리한다',()=>{
  assert.deepEqual(parseCalendarTodoPrompt('날짜 09월21일 내용 차량 점검',new Date('2026-09-01')),{date:'2026-09-21',content:'차량 점검'});
  assert.deepEqual(parseCalendarTodoPrompt('2027년 1월 5일 보험 갱신',new Date('2026-09-01')),{date:'2027-01-05',content:'보험 갱신'});
  assert.equal(parseCalendarTodoPrompt('날짜 02월30일 내용 오류',new Date('2026-01-01')),null);
});

test('캘린더 우측에 일정 입력 패널과 저장된 일정을 표시한다',()=>{
  assert.match(main,/TO DO LIST 일정추가/);
  assert.match(main,/name=\"date\"/);
  assert.match(main,/name=\"content\"/);
  assert.match(main,/name=\"prompt\"/);
  assert.match(main,/일정추가<\/button>/);
  assert.match(main,/초기화<\/button>/);
  assert.match(main,/api\('calendar-todos'/);
  assert.match(main,/renderCalendarTodos/);
});

test('일정을 D1에 저장하고 날짜순으로 조회한다',()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS calendar_todos/);
  assert.match(api,/parts\[0\]==='calendar-todos'/);
  assert.match(api,/ORDER BY scheduled_date,created_at/);
  assert.match(api,/INSERT INTO calendar_todos/);
  assert.match(api,/create_calendar_todo/);
});
