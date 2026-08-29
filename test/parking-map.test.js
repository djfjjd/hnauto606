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
  const html=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  assert.equal((html.match(/class="parking-cell/g)||[]).length,180);
  assert.match(html,/A01/);
  assert.match(html,/I20/);
});

test('B3층과 새싹타워는 기본 접힘 상태에서 1행 위 토글만 표시한다',()=>{
  for(const zoneId of ['b3','tower']){
    const collapsed=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:false});
    assert.match(collapsed,new RegExp(`grid-row:2[^>]+data-toggle-map="${zoneId}"`));
    assert.doesNotMatch(collapsed,/class="parking-cell/);
    const expanded=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:true});
    assert.match(expanded,/aria-label="A01 빈 자리"/);
  }
});

test('빈 자리에는 주차 가능 보조 문구를 표시하지 않는다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  assert.doesNotMatch(html,/주차 가능/);
});

test('차량 Cell에는 차량번호 뒤 4자리만 크게 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'spot-1',label:'A1',plate:'186저9439',model:'쏘나타',alerts:[]}],undefined,{expanded:true});
  assert.match(html,/<strong>9439<\/strong>/);
  assert.match(html,/data-spot="spot-1"/);
});

test('주차 차량 Cell에는 차량 색상 클래스가 적용된다',()=>{
  const white=renderParkingMap(parkingLayouts.b3,[{id:'white-car',label:'A1',plate:'11가1234',model:'차량',color:'흰색',alerts:[]}],undefined,{expanded:true});
  const gray=renderParkingMap(parkingLayouts.b3,[{id:'gray-car',label:'A1',plate:'11가5678',model:'차량',color:'은색',alerts:[]}],undefined,{expanded:true});
  assert.match(white,/vehicle-color-white/);
  assert.match(gray,/vehicle-color-gray/);
  assert.match(white,/draggable="true"/);
});

test('6층은 기본적으로 01~14행을 숨기고 30개 자리를 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:true});
  assert.doesNotMatch(html,/>01<\/b>/);
  assert.match(html,/grid-column:1\/span 10;grid-row:2[^>]+data-toggle-map="pillar11"/);
  assert.match(html,/>▼<\/span> 펼치기/);
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,30);
  assert.equal((html.match(/is-company-tint/g)||[]).length,5);
  assert.match(html,/>윤카<\/strong>/);
  assert.match(html,/type-company-area is-borderless[^>]+><strong>윤카<\/strong>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:9\/span 1[^>]+><strong>윤카<\/strong>/);
  assert.match(expanded,/grid-column:1\/span 10;grid-row:2[^>]+data-toggle-map="pillar11"/);
  assert.match(expanded,/>▲<\/span> 접기/);
});

test('옥상의 A17~C17은 하나의 넓은 주차 Cell로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.roof,[{id:'roof-a17',label:'A17',plate:'',alerts:[]}]);
  assert.match(html,/data-spot="roof-a17"[^>]+grid-column:2\/span 3/);
  assert.match(html,/주차장 출입구 램프/);
  assert.match(html,/grid-column:5\/span 2;grid-row:11\/span 4[^>]+><strong>계단<\/strong>/);
  assert.doesNotMatch(html,/A21|D21|I21/);
  assert.doesNotMatch(html,/>09<\/b>/);
  assert.match(html,/>▼<\/span> 펼치기/);
});

test('오토플렉스 13층은 지정 행과 12개 주차면만 기본 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.auto13,[],new Set(),{zoneId:'auto13',expanded:false});
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,12);
  assert.doesNotMatch(html,/>09<\/b>/);
  assert.doesNotMatch(html,/>08<\/b>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:6\/span 1[^>]+><strong>화장실<\/strong>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:7\/span 1[^>]+><strong>E\/V<\/strong>/);
  assert.doesNotMatch(html,/GRID|차량번호 뒤 4자리 표시/);
  assert.doesNotMatch(html,/>E<\/b>/);
  assert.doesNotMatch(html,/E09/);
  const expanded=renderParkingMap(parkingLayouts.auto13,[],new Set(),{zoneId:'auto13',expanded:true});
  assert.doesNotMatch(expanded,/GRID|차량번호 뒤 4자리 표시/);
  assert.match(expanded,/>I<\/b>/);
  assert.match(expanded,/>09<\/b>/);
  assert.match(expanded,/I18/);
  assert.match(expanded,/grid-column:1\/span 10;grid-row:2[^>]+data-toggle-map="auto13"/);
});

test('B5층은 접으면 17~20행도 숨긴다',()=>{
  const html=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:false});
  assert.doesNotMatch(html,/>15<\/b>/);
  assert.doesNotMatch(html,/>16<\/b>/);
  assert.doesNotMatch(html,/>21<\/b>/);
  assert.doesNotMatch(html,/>17<\/b>/);
  assert.doesNotMatch(html,/>20<\/b>/);
  const expanded=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:true});
  assert.match(expanded,/>15<\/b>/);
  assert.match(expanded,/>21<\/b>/);
  assert.match(expanded,/grid-column:5\/span 2[^>]+><strong>E\/V · 화장실<\/strong>/);
});

test('모든 접이식 층은 펼친 뒤에도 토글 행이 움직이지 않는다',()=>{
  for(const zoneId of ['pillar11','b3','b5','roof','tower','auto13']){
    const collapsed=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:false});
    const expanded=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:true});
    const toggleRow=html=>html.match(new RegExp(`grid-column:1\\/span \\d+;grid-row:(\\d+)[^>]+data-toggle-map="${zoneId}"`))?.[1];
    assert.equal(toggleRow(expanded),toggleRow(collapsed),`${zoneId} 토글 위치가 변경됨`);
  }
});

test('특수 공간 범위는 하나의 CSS Grid 영역으로 합쳐진다',()=>{
  const layout={name:'테스트',columns:9,rows:20,specialAreas:[{from:'A01',to:'C04',type:'company-area',label:'제이카'}]};
  const html=renderParkingMap(layout,[]);
  assert.match(html,/grid-column:2\/span 3;grid-row:2\/span 4/);
  assert.equal((html.match(/class="parking-special/g)||[]).length,1);
  assert.doesNotMatch(html,/<small>company-area<\/small>/);
  assert.equal((html.match(/class="parking-cell/g)||[]).length,168);
});
