import test from 'node:test';
import assert from 'node:assert/strict';
import {isKoreanPublicHoliday} from '../src/korean-holidays.js';

test('대한민국 고정 공휴일과 음력 공휴일을 구분한다',()=>{
  assert.equal(isKoreanPublicHoliday('2026-10-03'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-24'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-25'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-26'),true);
  assert.equal(isKoreanPublicHoliday('2026-09-21'),false);
  assert.equal(isKoreanPublicHoliday('2026-10-05'),true);
});
