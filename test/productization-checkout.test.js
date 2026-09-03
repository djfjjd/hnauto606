import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('주차 도면 차량 클릭은 상세 대신 상품화출차 팝업을 연다',()=>{
  assert.match(main,/state\.mode=used\(selected\)\?'productization':'assign'/);
  assert.match(main,/state\.mode==='productization'\?'상품화출차'/);
  assert.match(main,/state\.mode==='productization'\?productizationForm\(s\)/);
});

test('상품화출차 팝업은 작업 5종과 오늘 날짜 및 작업별 입력을 제공한다',()=>{
  assert.match(main,/\['performance','성능'\],\['body','판금'\],\['dent','덴트'\],\['polish','광택'\],\['car-center','카센터\(기타\)'\]/);
  assert.match(main,/name="serviceDate" value="\$\{today\}" required/);
  assert.match(main,/data-service-detail="performance"[\s\S]*value="입력하지 않음" disabled/);
  assert.match(main,/name="exteriorCount"/);
  assert.match(main,/name="dentNote"[\s\S]*name="dentCost"/);
  assert.match(main,/name="polishType"[\s\S]*value="스타"[\s\S]*value="광택"/);
  assert.match(main,/name="carCenterNote"/);
  assert.match(main,/bindProductizationFields/);
  assert.match(css,/\.productization-tabs\{display:grid;grid-template-columns:repeat\(5,minmax\(0,1fr\)\)/);
});

test('상품화출차 팝업은 위치 문구와 취소를 숨기고 기존 주차 삭제를 제공한다',()=>{
  assert.match(main,/state\.mode==='productization'/);
  assert.match(main,/class="ghost danger" data-unassign>삭제<\/button>/);
  assert.doesNotMatch(main,/data-unassign>취소<\/button>/);
  assert.match(main,/>상품화출차<\/button>/);
});

test('상품화출차는 주차면 해제와 서비스·이동·감사·알림 이력을 함께 저장한다',()=>{
  assert.match(api,/parts\[2\]==='productization'/);
  assert.match(api,/INSERT INTO service_records/);
  assert.match(api,/productization_checkout/);
  assert.match(api,/notifyVehicleAction\(context,vehicle,'상품화출차','상품화출차',eventId\)/);
  assert.match(main,/vehicles\/\$\{s\.vehicleId\}\/productization/);
});

test('차량현황판 상세 수정은 차량 행이 아닌 연필 버튼으로만 연다',()=>{
  assert.match(main,/data-edit-vehicle="\$\{esc\(s\.vehicleId\|\|s\.id\)\}"/);
  assert.match(main,/querySelectorAll\('\[data-edit-vehicle\]'\)/);
  assert.doesNotMatch(main,/role="button" tabindex="0" data-queue/);
});
