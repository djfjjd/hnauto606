import test from 'node:test';
import assert from 'node:assert/strict';
import {isKoreanPublicHoliday,recentKoreanBusinessDayCutoff} from '../src/korean-holidays.js';

test('대한민국 고정 공휴일과 음력 공휴일을 구분한다',()=>{
  assert.equal(isKoreanPublicHoliday('2026-10-03'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-24'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-25'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-26'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-21'),false);
  assert.equal(isKoreanPublicHoliday('2026-10-05'),true);
});

test('최근 3영업일 기준일은 주말과 한국 공휴일을 건너뛴다',()=>{
  assert.equal(recentKoreanBusinessDayCutoff('2026-10-11',3),'2026-10-06');
  assert.equal(recentKoreanBusinessDayCutoff('2026-10-06',3),'2026-10-01');
});
