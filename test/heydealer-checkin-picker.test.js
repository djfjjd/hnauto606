import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('신규 입고 모달은 저장된 헤이딜러 차량과 직접입력을 선택할 수 있다',()=>{
  assert.match(main,/class="heydealer-vehicle-picker"/);
  assert.match(main,/<option value="manual">직접입력<\/option>/);
  assert.match(main,/const data=await api\('heydealer'\)/);
  assert.match(main,/state\.heydealerRecords=data\.records\|\|\[\]/);
  assert.match(main,/document\.querySelectorAll\('\[data-new\]'\)\.forEach\(el=>el\.onclick=openNewVehicle\)/);
});

test('저장 차량 선택 시 현재 입고 양식의 일치 필드를 자동 입력한다',()=>{
  assert.match(main,/record\?\{plate:record\.plate,model:record\.model,modelYear:record\.model_year,mileage:record\.mileage,color:normalizeVehicleColor\(record\.color\),manager:record\.manager,options:record\.options\}/);
  assert.match(main,/for\(const \[name,value\] of Object\.entries\(values\)\)/);
  assert.match(main,/field\.value=value\|\|''/);
  assert.match(main,/if\(select\.value==='manual'\)form\.elements\.namedItem\('plate'\)\?\.focus\(\)/);
});
