import test from 'node:test';import assert from 'node:assert/strict';import {normalizePlate,validateVehicle,canWrite} from '../src/validation.js';
test('차량번호 공백을 제거한다',()=>assert.equal(normalizePlate('186저 9439'),'186저9439'));
test('올바르지 않은 차량번호를 거부한다',()=>assert.equal(validateVehicle({plate:'테스트'}).ok,false));
test('직원은 변경할 수 있고 조회 전용은 변경할 수 없다',()=>{assert.equal(canWrite('staff'),true);assert.equal(canWrite('viewer'),false)});
