import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizePosition,parkingCapacity,parkingLayouts,towerParkingLabel} from '../src/parking-layouts.js';
import {renderParkingMap} from '../src/parking-map.js';
import {STATUS} from '../src/data.js';

test('기존 위치 라벨을 두 자리 행 좌표로 정규화한다',()=>{
  assert.equal(normalizePosition('A1'),'A01');
  assert.equal(normalizePosition('I20'),'I20');
  assert.equal(normalizePosition('J2'),'J02');
  assert.equal(normalizePosition('A21'),'A21');
});

test('새싹타워 실제 좌표를 B5·B6 주차번호로 변환한다',()=>{
  assert.equal(towerParkingLabel('D04'),'B5층 01');
  assert.equal(towerParkingLabel('D08'),'B5층 05');
  assert.equal(towerParkingLabel('A12'),'B5층 07');
  assert.equal(towerParkingLabel('J04'),'B5층 40');
  assert.equal(towerParkingLabel('D17'),'B6층 01');
  assert.equal(towerParkingLabel('A25'),'B6층 06');
  assert.equal(towerParkingLabel('G14'),'B6층 22');
});

test('전체 주차면은 실제 parking Cell만 합산한다',()=>{
  assert.equal(parkingCapacity(parkingLayouts.pillar11),30);
  assert.equal(parkingCapacity(parkingLayouts.b3),5);
  assert.equal(parkingCapacity(parkingLayouts.b5),12);
  assert.equal(parkingCapacity(parkingLayouts.roof),20);
  assert.equal(parkingCapacity(parkingLayouts.tower),34);
  assert.equal(Object.values(parkingLayouts).reduce((sum,layout)=>sum+parkingCapacity(layout),0),101);
});

test('B3층은 A·B열을 제외하고 C~I열을 도면 오른쪽 끝에 맞춘다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.equal((html.match(/class="parking-cell/g)||[]).length,140);
  assert.doesNotMatch(html,/A01|B01/);
  assert.match(html,/grid-column:2;grid-row:2[^>]+aria-label="C01 비주차 구역"/);
  assert.match(html,/I20/);
  assert.match(html,/--map-columns:7/);
  assert.match(css,/\.parking-map\[data-map-zone="b3"\] \.parking-map-grid\{margin-left:auto\}/);
  assert.match(css,/\.parking-map\[data-map-zone="pillar11"\] \.parking-map-scroll,\.parking-map\[data-map-zone="b3"\] \.parking-map-scroll\{padding-right:4px\}/);
  assert.match(html,/E\/V · 화장실/);
});

test('B3층은 접으면 17행 주차면과 21행 시설만 표시한다',()=>{
  const collapsed=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:false});
  assert.match(collapsed,/class="map-head-toggle" data-toggle-map="b3"/);
  assert.equal((collapsed.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,5);
  assert.doesNotMatch(collapsed,/aria-label="E16 비주차 구역"/);
  assert.doesNotMatch(collapsed,/>15<\/b>|>16<\/b>|>18<\/b>|>20<\/b>/);
  assert.match(collapsed,/aria-label="E17 빈 자리"/);
  assert.match(collapsed,/E\/V · 화장실/);
  const expanded=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  assert.doesNotMatch(expanded,/aria-label="A01 비주차 구역"|aria-label="B01 비주차 구역"/);
  assert.match(expanded,/aria-label="E16 비주차 구역"/);
  assert.match(expanded,/aria-label="E17 빈 자리"/);
});

test('B3층 E16~I16과 E17~I17 사이에 19번기둥 노란 실선을 표시한다',()=>{
  const collapsed=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  assert.match(collapsed,/class="parking-pillar-divider" style="grid-column:4\/span 5;grid-row:2"[^>]*><span>19번기둥<\/span>/);
  assert.match(expanded,/class="parking-pillar-divider" style="grid-column:4\/span 5;grid-row:18"[^>]*><span>19번기둥<\/span>/);
});

test('새싹타워는 접으면 B5·B6를 7칸 기준으로 표시하고 펼치면 X 구역을 유지한다',()=>{
  const collapsed=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:true});
  assert.equal((collapsed.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,20);
  assert.match(collapsed,/aria-label="D07 빈 자리"[^>]*><small class="parking-space-number">04<\/small>/);
  assert.match(collapsed,/aria-label="M07 빈 자리"[^>]*><small class="parking-space-number">34<\/small>/);
  assert.match(collapsed,/aria-label="D17 빈 자리"[^>]*><small class="parking-space-number">01<\/small>/);
  assert.doesNotMatch(collapsed,/aria-label="G14 빈 자리"/);
  assert.doesNotMatch(collapsed,/class="map-row"|>B5층<\/b>|>B6층<\/b>/);
  assert.doesNotMatch(collapsed,/class="map-column"/);
  assert.match(collapsed,/--map-columns:7;--map-rows:3;--map-header-rows:0/);
  assert.match(collapsed,/class="parking-map-grid has-no-column-header has-no-row-label"/);
  assert.match(collapsed,/data-toggle-map="tower"[^>]*aria-expanded="false"/);
  assert.match(expanded,/class="map-column"[^>]*>M<\/b>/);
  assert.doesNotMatch(expanded,/class="map-row"/);
  assert.match(expanded,/--map-columns:13;--map-rows:24;--map-header-rows:1/);
  assert.match(expanded,/data-toggle-map="tower"[^>]*aria-expanded="true"/);
  assert.match(expanded,/class="parking-special type-facility" style="grid-column:5\/span 5;grid-row:5\/span 5"[^>]*><strong>B5층<\/strong>/);
  assert.match(expanded,/class="parking-special type-entrance" style="grid-column:4\/span 10;grid-row:10\/span 4"[^>]*><strong>주차장 출입구 램프<\/strong>/);
  assert.match(expanded,/class="parking-special type-facility" style="grid-column:5\/span 5;grid-row:17\/span 5"[^>]*><strong>B6층<\/strong>/);
  assert.match(expanded,/class="parking-special type-entrance" style="grid-column:4\/span 10;grid-row:22\/span 4"[^>]*><strong>주차장 출입구 램프<\/strong>/);
  assert.match(expanded,/class="parking-special type-blocked" style="grid-column:10\/span 4;grid-row:14\/span 8"/);
  assert.doesNotMatch(expanded,/aria-label="M13 비주차 구역"/);
  for(const code of ['B02','C02','D02','E02','F02','G02','H02','I02','J02'])assert.match(expanded,new RegExp(`aria-label="${code} 비주차 구역"`));
  for(const code of ['A01','M01','D03','J03'])assert.match(expanded,new RegExp(`aria-label="${code} 비주차 구역"`));
  for(const code of ['A02','A12','D04','D06','B01','D01','G01','H01','M08','A15','A18','J04','J08'])assert.match(expanded,new RegExp(`class="parking-cell is-vacant is-unavailable"[^>]*aria-label="${code} 비활성 구역"[^>]*><strong class="parking-unavailable-mark" aria-hidden="true">X<\\/strong>`));
  for(const code of ['H14','I14'])assert.match(expanded,new RegExp(`class="parking-cell is-layout-blocked"[^>]*aria-label="${code} 비주차 구역"`));
  for(const code of ['D07','D08','E01','F01','I01','L01','M02','M07','A16','A17','A19','A25','D17','D21','B14','G14'])assert.match(expanded,new RegExp(`aria-label="${code} 빈 자리"`));
  assert.doesNotMatch(expanded,/>13<\/b>|>26<\/b>|aria-label="[A-M](?:13|26) /);
  assert.match(expanded,/class="parking-section-border" style="grid-column:1\/span 13;grid-row:2\/span 12"/);
  assert.match(expanded,/class="parking-section-border" style="grid-column:1\/span 13;grid-row:14\/span 12"/);
  assert.match(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/\.parking-section-border\{z-index:4;border:3px solid #facc15;pointer-events:none\}/);
  assert.match(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/\.parking-map\[data-map-zone="tower"\] \.parking-section-border\{border-color:#247ba0\}/);
  assert.match(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/\.parking-cell\.is-vacant\.is-unavailable::before\{content:none\}/);
  assert.match(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/\.parking-map\[data-map-zone="tower"\] \.parking-special\.type-entrance strong\{writing-mode:horizontal-tb/);
  assert.match(readFileSync(new URL('../src/style.css',import.meta.url),'utf8'),/\.parking-map\[data-map-zone="tower"\] \.parking-special\.type-facility strong\{font-size:36px\}/);
});

test('새싹타워 지정 셀 사이에 노란 경계선을 표시한다',()=>{
  const expanded=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:true});
  for(const label of ['A4와 A5 사이','A6과 A7 사이','A8과 A9 사이','A16과 A17 사이','A18과 A19 사이','A20과 A21 사이','M3과 M4 사이','M6과 M7 사이'])assert.match(expanded,new RegExp(`class="tower-boundary-line is-horizontal"[^>]+aria-label="${label}"`));
  assert.match(expanded,/class="tower-boundary-line is-horizontal" style="grid-column:1;grid-row:18" aria-label="A16과 A17 사이"/);
  assert.match(expanded,/class="tower-boundary-line is-horizontal" style="grid-column:1;grid-row:20" aria-label="A18과 A19 사이"/);
  assert.match(expanded,/class="tower-boundary-line is-horizontal" style="grid-column:1;grid-row:22" aria-label="A20과 A21 사이"/);
  for(const label of ['1행 E와 F 사이','1행 H와 I 사이','13행 E와 F 사이'])assert.match(expanded,new RegExp(`class="tower-boundary-line is-vertical"[^>]+aria-label="${label}"`));
  const collapsed=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:false});
  assert.doesNotMatch(collapsed,/tower-boundary-line/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.tower-boundary-line\.is-horizontal\{[^}]*border-top:3px solid #facc15/);
  assert.match(css,/\.tower-boundary-line\.is-vertical\{[^}]*border-left:3px solid #facc15/);
});

test('새싹타워 접기 상태는 층 구분 없이 모든 주차 차량을 빈자리보다 먼저 정렬한다',()=>{
  const spots=[
    {id:'b5-empty',label:'D07',plate:'',alerts:[]},
    {id:'b5-car',label:'L01',plate:'12가1234',model:'그랜저',alerts:[]},
    {id:'b6-empty',label:'D17',plate:'',alerts:[]},
    {id:'b6-car',label:'G14',plate:'34나5678',model:'쏘나타',alerts:[]},
  ];
  const html=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:false});
  assert.equal((html.match(/class="parking-cell/g)||[]).length,20);
  assert.ok(html.indexOf('aria-label="L01 12가1234 주차 중"')<html.indexOf('aria-label="D07 빈 자리"'));
  assert.ok(html.indexOf('aria-label="G14 34나5678 주차 중"')<html.indexOf('aria-label="D17 빈 자리"'));
  assert.ok(html.indexOf('aria-label="G14 34나5678 주차 중"')<html.indexOf('aria-label="D07 빈 자리"'));
  assert.match(html,/grid-row:1\/span 1[^>]*aria-label="L01 12가1234 주차 중"[\s\S]*grid-row:1\/span 1[^>]*aria-label="G14 34나5678 주차 중"/);
});

test('새싹타워 B6 차량 20대는 접기 상태에서 7칸·7칸·6칸으로 표시한다',()=>{
  const labels=['D17','D18','D19','D20','D21','A25','A24','A23','A22','A21','A20','A19','A17','A16','B14','C14','D14','E14','F14','G14'];
  const spots=labels.map((label,index)=>({id:`b6-${index}`,label,plate:`12가${String(index).padStart(4,'0')}`,model:'차량',alerts:[]}));
  const html=renderParkingMap(parkingLayouts.tower,spots,undefined,{zoneId:'tower',expanded:false});
  assert.equal((html.match(/class="parking-cell/g)||[]).length,20);
  assert.equal((html.match(/grid-row:1\/span 1/g)||[]).length,7);
  assert.equal((html.match(/grid-row:2\/span 1/g)||[]).length,7);
  assert.equal((html.match(/grid-row:3\/span 1/g)||[]).length,6);
});

test('새싹타워 펼침 도면은 12행씩 M열 오른쪽에 나란히 배치할 수 있다',()=>{
  const html=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:true,splitAfterRow:12});
  assert.match(html,/class="parking-map-grid has-no-row-label is-side-by-side"/);
  assert.match(html,/--map-columns:26;--map-rows:12;--map-header-rows:1/);
  assert.match(html,/aria-label="A12 비활성 구역"/);
  assert.match(html,/class="parking-cell is-vacant is-unavailable" style="grid-column:14;grid-row:3"[^>]*aria-label="A15 비활성 구역"/);
  assert.match(html,/class="parking-section-border" style="grid-column:14\/span 13;grid-row:2\/span 12"/);
});

test('뷰어 새싹타워는 B5·B6 층명을 표시하고 B6은 H열까지만 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.tower,[],new Set(),{zoneId:'tower',expanded:true,splitAfterRow:12,splitSecondColumns:8,firstSideFacilityLabel:'B5층',secondSideFacilityLabel:'B6층'});
  assert.match(html,/--map-columns:21;--map-rows:12;--map-header-rows:1/);
  assert.match(html,/grid-column:5\/span 5;grid-row:5\/span 5"[^>]*><strong>B5층<\/strong>/);
  assert.match(html,/grid-column:18\/span 4;grid-row:5\/span 5"[^>]*><strong>B6층<\/strong>/);
  assert.match(html,/grid-column:21;grid-row:1"[^>]*>H<\/b>/);
  assert.doesNotMatch(html,/grid-column:22;grid-row:1|aria-label="I(?:14|15|16|17|18|19|20|21|22|23|24|25) /);
  assert.match(html,/class="parking-section-border" style="grid-column:14\/span 8;grid-row:2\/span 12"/);
});

test('빈 자리에는 주차 가능 보조 문구를 표시하지 않는다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[],new Set(),{zoneId:'b3',expanded:true});
  assert.doesNotMatch(html,/주차 가능/);
  assert.doesNotMatch(html,/>빈 자리</);
});

test('빈 주차면은 문구 대신 검정 그림자가 있는 빨간 소문자 o로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-vacant::before\{content:"o"/);
  assert.match(css,/\.parking-map-grid\.has-no-column-header\{grid-template-rows:repeat\(var\(--map-rows\),39px\)\}/);
  assert.match(css,/color:#e33e3e/);
  assert.match(css,/text-shadow:1px 1px 0 #111/);
  assert.doesNotMatch(css,/\.parking-cell\.is-vacant::after/);
});

test('차량 Cell에는 차량번호 뒤 4자리만 크게 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'spot-1',label:'E17',plate:'186저9439',model:'쏘나타',alerts:[]}],undefined,{expanded:true});
  assert.match(html,/<strong>9439<\/strong>/);
  assert.match(html,/data-spot="spot-1"/);
});

test('주차 차량 Cell에는 차량 색상 클래스가 적용된다',()=>{
  const white=renderParkingMap(parkingLayouts.b3,[{id:'white-car',label:'E17',plate:'11가1234',model:'차량',color:'흰색',alerts:[]}],undefined,{expanded:true});
  const gray=renderParkingMap(parkingLayouts.b3,[{id:'gray-car',label:'E17',plate:'11가5678',model:'차량',color:'은색',alerts:[]}],undefined,{expanded:true});
  const blue=renderParkingMap(parkingLayouts.b3,[{id:'blue-car',label:'E17',plate:'11가9012',model:'차량',color:'블루',alerts:[]}],undefined,{expanded:true});
  assert.match(white,/vehicle-color-white/);
  assert.match(gray,/vehicle-color-gray/);
  assert.match(blue,/vehicle-color-blue/);
  assert.match(white,/draggable="true"/);
});

test('렌터카 번호는 빨간 글씨 클래스를, 노란색 차량은 노란 배경 클래스를 사용한다',()=>{
  const rental=renderParkingMap(parkingLayouts.b3,[{id:'rental',label:'E17',plate:'123하4567',model:'렌터카',color:'검정',alerts:[]}],undefined,{expanded:true});
  const yellow=renderParkingMap(parkingLayouts.b3,[{id:'yellow',label:'E17',plate:'123가4567',model:'차량',color:'노랑',alerts:[]}],undefined,{expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(rental,/is-rental/);
  assert.match(yellow,/vehicle-color-yellow/);
  assert.match(css,/\.parking-cell\.is-occupied\.is-rental strong\{color:#ef3d35!important/);
  assert.match(css,/vehicle-color-yellow strong,[^{]+\{color:#111!important/);
});

test('확인 필요 차량은 강조 배경 없이 왼쪽 아래에 경고등 이미지를 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'alert-car',label:'E17',plate:'11가1234',model:'차량',color:'검정',alerts:['battery','engine']}],undefined,{expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.doesNotMatch(html,/has-alert/);
  assert.match(html,/class="parking-alert-icons"/);
  assert.match(html,/alt="배터리경고등"/);
  assert.match(html,/alt="엔진경고등"/);
  assert.equal((html.match(/parking-alert-icons[\s\S]*?<\/span>/)?.[0].match(/<img /g)||[]).length,2);
  assert.match(css,/\.parking-cell \.parking-alert-icons\{position:absolute;left:1px;bottom:2px/);
  assert.match(css,/\.parking-cell>strong,\.parking-cell>span:not\(\.parking-alert-icons\)\{position:relative;z-index:2\}/);
  assert.match(css,/\.parking-alert-icons[^}]*z-index:0;pointer-events:none/);
  assert.match(css,/\.parking-alert-icons img\{width:26px;height:26px/);
  assert.doesNotMatch(css,/\.parking-cell\.has-alert\{/);
});

test('특이사항이 있는 주차 차량은 경고등과 같은 높이의 오른쪽에 빨간 느낌표를 표시한다',()=>{
  const spot={id:'memo-car',label:'E17',plate:'11가1234',model:'차량',memo:'외관 확인',options:'선루프',alerts:['battery']};
  const withMemo=renderParkingMap(parkingLayouts.b3,[spot],undefined,{expanded:true});
  const withoutMemo=renderParkingMap(parkingLayouts.b3,[{...spot,memo:'X'}],undefined,{expanded:true});
  const emptyMemo=renderParkingMap(parkingLayouts.b3,[{...spot,memo:''}],undefined,{expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(withMemo,/class="parking-alert-icons"[\s\S]*?class="parking-option-indicator" aria-label="특이사항 있음" title="외관 확인">!<\/i>/);
  assert.doesNotMatch(withoutMemo,/parking-option-indicator/);
  assert.doesNotMatch(emptyMemo,/parking-option-indicator/);
  assert.match(css,/\.parking-cell \.parking-option-indicator\{position:absolute;right:1px;bottom:2px;top:auto/);
  assert.match(css,/color:#e33e3e/);
});

test('차량 구역 경고등 PNG는 흰 배경 대신 투명 알파 채널을 사용한다',()=>{
  for(const status of STATUS){
    const image=readFileSync(new URL(`../public/${status.icon.normalize('NFD')}`,import.meta.url));
    assert.ok(image.includes(Buffer.from('tRNS')),`${status.label} 아이콘에 투명도 정보가 필요합니다.`);
  }
});

test('녹색 차량은 주차구역에서 차종을 흰색으로 표시한다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.vehicle-color-green span\{color:#fff!important\}/);
});

test('출고 후 주차 중인 차량은 빨간 글씨와 출고됨 표시를 사용한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'checked-out-car',label:'E17',plate:'335모6853',model:'A6',color:'검정',isCheckedOut:true,alerts:[]}],undefined,{expanded:true});
  assert.match(html,/is-checked-out/);
  assert.match(html,/<strong>6853<\/strong><span>\(출고됨\) A6<\/span>/);
  assert.match(html,/335모6853 출고됨/);
});

test('계약 차량은 출고 차량과 구분해 계약됨으로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b3,[{id:'a6',label:'E17',plate:'123가5827',model:'GV80',color:'흰색',alerts:[],isContracted:true}],undefined,{expanded:true});
  assert.match(html,/is-contracted vehicle-color-white|vehicle-color-white[^\"]*is-contracted/);
  assert.doesNotMatch(html,/is-checked-out/);
  assert.match(html,/<strong>5827<\/strong><span>\(계약됨\) GV80<\/span>/);
  assert.match(html,/123가5827 계약됨/);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-occupied\.is-contracted strong\{color:#ef3d35!important/);
  assert.match(css,/\.parking-cell\.is-occupied\.is-contracted\.vehicle-color-white span\{color:#111!important\}/);
});

test('출고 차량의 빨간 글씨에는 그림자를 표시하지 않는다',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/\.parking-cell\.is-occupied\.is-checked-out strong,[^{]+\{[^}]*text-shadow:none/);
});

test('6층은 기본적으로 01~14행을 숨기고 30개 자리를 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:true});
  assert.doesNotMatch(html,/>01<\/b>/);
  assert.match(html,/class="map-head-toggle" data-toggle-map="pillar11"/);
  assert.match(html,/class="parking-map" data-map-zone="pillar11"/);
  assert.doesNotMatch(html,/class="parking-map" data-zone=/);
  assert.match(html,/>▼<\/span> 펼치기/);
  assert.equal((html.match(/class="parking-cell is-vacant is-virtual/g)||[]).length,30);
  assert.equal((html.match(/is-company-tint/g)||[]).length,5);
  assert.match(html,/>윤카<\/strong>/);
  assert.match(html,/type-company-area is-borderless[^>]+><strong>윤카<\/strong>/);
  assert.match(html,/grid-column:2\/span 2;grid-row:8\/span 1[^>]+><strong>윤카<\/strong>/);
  assert.match(expanded,/class="map-head-toggle" data-toggle-map="pillar11"/);
  assert.match(expanded,/>▲<\/span> 접기/);
});

test('6층 E17~I17과 E18~I18 사이에 11번기둥 노란 실선을 표시한다',()=>{
  const collapsed=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.pillar11,[],new Set(),{zoneId:'pillar11',expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(collapsed,/class="parking-pillar-divider" style="grid-column:6\/span 5;grid-row:5"[^>]*><span>11번기둥<\/span>/);
  assert.match(expanded,/class="parking-pillar-divider" style="grid-column:6\/span 5;grid-row:19"[^>]*><span>11번기둥<\/span>/);
  assert.match(css,/\.parking-pillar-divider\{[^}]*border-top:3px solid #facc15/);
  assert.match(css,/\.parking-pillar-divider span\{position:absolute;right:calc\(100% \+ 5px\);top:0;transform:translateY\(-50%\);padding:2px 6px;color:#111;background:#facc15;font-size:13px/);
});

test('옥상의 A17~C17은 하나의 넓은 주차 Cell로 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.roof,[{id:'roof-a17',label:'A17',plate:'',alerts:[]}]);
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(html,/class="parking-map-grid has-no-row-label"/);
  assert.match(css,/\.parking-map\[data-map-zone="roof"\] \.parking-map-scroll,\.parking-map\[data-map-zone="tower"\] \.parking-map-scroll\{padding-left:4px\}/);
  assert.match(html,/data-spot="roof-a17"[^>]+grid-column:1\/span 3/);
  assert.match(html,/주차장 출입구 램프/);
  assert.match(html,/grid-column:4\/span 2;grid-row:10\/span 4[^>]+><strong>계단<\/strong>/);
  assert.doesNotMatch(html,/A21|D21|I21/);
  assert.doesNotMatch(html,/>09<\/b>/);
  assert.match(html,/>▼<\/span> 펼치기/);
});

test('B5층은 접으면 14행부터 17행까지와 시설행을 표시한다',()=>{
  const html=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:false});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(html,/class="parking-map-grid has-no-column-header has-no-row-label"/);
  assert.match(css,/\.parking-map\[data-map-zone="b5"\] \.parking-map-scroll\{padding-left:4px\}/);
  assert.match(html,/aria-label="A14 비주차 구역"[^>]*style="grid-column:1;grid-row:1"|style="grid-column:1;grid-row:1"[^>]*aria-label="A14 비주차 구역"/);
  assert.match(html,/aria-label="F15 빈 자리"/);
  assert.match(html,/aria-label="F16 빈 자리"/);
  assert.doesNotMatch(html,/>15<\/b>/);
  assert.doesNotMatch(html,/>16<\/b>/);
  assert.doesNotMatch(html,/>21<\/b>/);
  assert.doesNotMatch(html,/aria-label="A13 비주차 구역"/);
  assert.match(html,/aria-label="A14 비주차 구역"/);
  assert.match(html,/aria-label="F17 비주차 구역"/);
  assert.doesNotMatch(html,/aria-label="F18 비주차 구역"/);
  assert.doesNotMatch(html,/>20<\/b>/);
  const expanded=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:true});
  assert.match(expanded,/>15<\/b>/);
  assert.match(expanded,/>21<\/b>/);
  assert.match(expanded,/grid-column:5\/span 2[^>]+><strong>E\/V · 화장실<\/strong>/);
  assert.match(expanded,/--map-columns:7/);
  assert.doesNotMatch(expanded,/aria-label="H01 비주차 구역"|aria-label="I01 비주차 구역"/);
});

test('B5층 A13~F13·A14~F14 사이와 A17~F17·A18~F18 사이에 오른쪽 기둥선을 표시한다',()=>{
  const collapsed=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:false});
  const expanded=renderParkingMap(parkingLayouts.b5,[],new Set(),{zoneId:'b5',expanded:true});
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(collapsed,/class="parking-pillar-divider is-label-right" style="grid-column:1\/span 6;grid-row:1"[^>]*><span>9번기둥<\/span>/);
  assert.match(collapsed,/class="parking-pillar-divider is-label-right is-after-row" style="grid-column:1\/span 6;grid-row:4"[^>]*><span>8번기둥<\/span>/);
  assert.match(expanded,/class="parking-pillar-divider is-label-right" style="grid-column:2\/span 6;grid-row:15"[^>]*><span>9번기둥<\/span>/);
  assert.match(expanded,/class="parking-pillar-divider is-label-right" style="grid-column:2\/span 6;grid-row:19"[^>]*><span>8번기둥<\/span>/);
  assert.match(css,/\.parking-pillar-divider\.is-label-right span\{right:auto;left:calc\(100% \+ 5px\)\}/);
  assert.match(css,/\.parking-pillar-divider\.is-after-row\{align-self:end;margin-top:0;margin-bottom:-2px\}/);
});

test('모든 접이식 층은 토글을 제목 행 오른쪽에 표시하고 Grid 토글 행을 만들지 않는다',()=>{
  for(const zoneId of ['pillar11','b3','b5','roof']){
    const collapsed=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:false});
    const expanded=renderParkingMap(parkingLayouts[zoneId],[],new Set(),{zoneId,expanded:true});
    for(const html of [collapsed,expanded]){
      assert.match(html,new RegExp(`class="map-head-toggle" data-toggle-map="${zoneId}"`));
      assert.ok(html.indexOf('map-head-toggle')<html.indexOf('parking-map-scroll'));
      assert.doesNotMatch(html,/map-row-toggle/);
    }
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
