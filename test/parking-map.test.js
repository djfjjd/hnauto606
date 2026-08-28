import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePosition,parkingLayouts} from '../src/parking-layouts.js';
import {renderParkingMap} from '../src/parking-map.js';

test('기존 위치 라벨을 두 자리 행 좌표로 정규화한다',()=>{
  assert.equal(normalizePosition('A1'),'A01');
  assert.equal(normalizePosition('I20'),'I20');
  assert.equal(normalizePosition('A21'),'A21');
});

test('기본 층 도면은 9×20 주차 Cell을 자동 생성한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[]);
  assert.equal((html.match(/class="parking-cell/g)||[]).length,180);
  assert.match(html,/A01/);
  assert.match(html,/I20/);
});

test('차량 Cell에는 차량번호 뒤 4자리만 크게 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'spot-1',label:'A1',plate:'186저9439',model:'쏘나타',alerts:[]}]);
  assert.match(html,/<strong>9439<\/strong>/);
  assert.match(html,/data-spot="spot-1"/);
});

test('6층은 기본적으로 01~14행을 숨기고 30개 자리를 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:false});
  assert.doesNotMatch(html,/>01<\/b>/);
  assert.match(html,/grid-column:1\/span 10;grid-row:2[^>]+data-toggle-map="pillar11"/);
  assert.match(html,/>▼<\/span> 펼치기/);
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,30);
  assert.match(html,/>윤카<\/strong>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:9\/span 1[^>]+><strong>윤카<\/strong>/);
});

test('옥상의 A17~C17은 하나의 넓은 주차 Cell로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.roof,[{id:'roof-a17',label:'A17',plate:'',alerts:[]}]);
  assert.match(html,/data-spot="roof-a17"[^>]+grid-column:2\/span 3/);
  assert.match(html,/주차장 출입구 램프/);
});

test('특수 공간 범위는 하나의 CSS Grid 영역으로 합쳐진다',()=>{
  const layout={name:'테스트',columns:9,rows:20,specialAreas:[{from:'A01',to:'C04',type:'company-area',label:'제이카'}]};
  const html=renderParkingMap(layout,[]);
  assert.match(html,/grid-column:2\/span 3;grid-row:2\/span 4/);
  assert.equal((html.match(/class="parking-special/g)||[]).length,1);
  assert.equal((html.match(/class="parking-cell/g)||[]).length,168);
});
