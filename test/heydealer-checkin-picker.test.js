import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');

test('신규 입고 모달은 저장된 헤이딜러 차량과 직접입력을 선택할 수 있다',()=>{
  assert.match(main,/class="heydealer-vehicle-picker"/);
  assert.match(main,/<option value="">차량 불러오기<\/option>/);
  assert.match(main,/<option value="manual">직접입력<\/option>/);
  assert.match(main,/const data=await api\('heydealer'\)/);
  assert.match(main,/state\.heydealerRecords=data\.records\|\|\[\]/);
  assert.match(main,/document\.querySelectorAll\('\[data-new\]'\)\.forEach\(el=>el\.onclick=openNewVehicle\)/);
});

test('차량목록과 담당자 선택 글씨는 색상 선택과 같은 크기로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/#vehicle-form \.form-row select\{font-size:17px\}/);
  assert.match(css,/#vehicle-form \.heydealer-vehicle-picker select,#vehicle-form select\[name=manager\]\{font-size:17px\}/);
});

test('저장 차량 선택 시 현재 입고 양식의 일치 필드를 자동 입력한다',()=>{
  assert.match(main,/record\?\{plate:record\.plate,model:record\.model,modelYear:record\.model_year,mileage:record\.mileage,color:normalizeVehicleColor\(record\.color\),manager:record\.manager,options:record\.options\}/);
  assert.match(main,/for\(const \[name,value\] of Object\.entries\(values\)\)/);
  assert.match(main,/field\.value=value\|\|''/);
  assert.match(main,/if\(select\.value==='manual'\)form\.elements\.namedItem\('plate'\)\?\.focus\(\)/);
});

test('신규 입고 양식은 차량 불러오기 선택 전까지 나머지 항목을 비활성화한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(main,/<fieldset class="checkin-fields" \$\{fresh\?'disabled':''\}>/);
  assert.match(main,/fields\.disabled=!select\.value/);
  assert.match(main,/select\.addEventListener\('change',sync\);sync\(\)/);
  assert.match(css,/#vehicle-form \.checkin-fields:disabled\{opacity:\.45\}/);
});

test('신규 입고 팝업은 차량현황판 위치 문구를 표시하지 않는다',()=>{
  assert.match(main,/const hideLocation=state\.mode==='checkout'\|\|state\.mode==='productization'\|\|state\.mode==='service-entry'\|\|state\.mode==='reperformance'\|\|s\.id==='draft'/);
  assert.match(main,/\$\{hideLocation\?'':`<p class="eyebrow">\$\{s\.zone\} · \$\{s\.label\}<\/p>`\}/);
});

test('선택차량을 불러온 신규입고가 성공하면 해당 헤이딜러 기록을 삭제한다',()=>{
  assert.match(main,/importedRecordId=String\(f\.get\('heydealerRecord'\)\|\|''\)/);
  assert.match(main,/importedRecordId&&importedRecordId!=='manual'/);
  assert.match(main,/api\(`heydealer\/\$\{importedRecordId\}`,\{method:'DELETE'\}\)/);
  assert.match(main,/차량은 입고됐지만 선택차량목록 정리가 실패했습니다/);
});
