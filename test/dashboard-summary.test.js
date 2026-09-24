import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('차량 현황판에 총 주행거리·색상·입고일·특이사항을 순서대로 표시한다',()=>{
  assert.match(main,/<span>연식<\/span><span>총 주행거리<\/span><span>색상<\/span><span>입고일<\/span><span>특이사항<\/span>/);
  assert.match(main,/checkedInDate=String\(s\.checkedInAt\|\|''\)\.slice\(0,10\),checkedOutDate=String\(s\.checkedOutAt\|\|''\)\.slice\(0,10\)/);
});

test('상단 브랜드를 간결하게 표시하고 구글 스프레드시트 업무 링크를 제공한다',()=>{
  assert.doesNotMatch(main,/HANA AUTO/);
  assert.match(main,/https:\/\/docs\.google\.com\/spreadsheets\/d\/1N3cAmPeS7eOZoqW-k9r1bx_xI0XI-4e0aGo9B04wGbA\/edit\?gid=1361663048#gid=1361663048/);
  assert.match(main,/<img src="\/sheets\.png" alt="">/);
  assert.match(main,/<a href="\/drive">헤이딜러제로<\/a>/);
  assert.match(css,/\.brand::after \{ content:'ver\. 1\.0\.4';[^}]*font-size:12px/);
  assert.match(css,/\.brand-mark \{ content:url\('\/\(주\)하나오토\.png'\)/);
  assert.match(css,/\.brand span \{[^}]*mask:url\('\/하나오토헤드라인\.png'\)/);
  assert.match(main,/class="footer-brand"/);
  assert.match(css,/\.footer-brand\{[^}]*mask:url\('\/하나오토헤드라인\.png'\)/);
});

test('첫 화면 제목 오른쪽에 이번 달 일정 미니 캘린더를 표시한다',()=>{
  assert.match(main,/function parkingMiniCalendar\(\)/);
  assert.match(main,/state\.calendarRecords\.map\(heydealerScheduleDate\)/);
  assert.match(main,/class="parking-mini-calendar"/);
  assert.match(main,/data-parking-schedule-date="\$\{date\}"/);
  assert.match(main,/function openParkingDaySchedule\(date\)/);
  assert.match(main,/state\.calendarRecords\.filter\(record=>heydealerScheduleDate\(record\)===date\)/);
  assert.match(main,/차량번호 \$\{records\.length\}대/);
  assert.match(main,/openParkingDaySchedule\(button\.dataset\.parkingScheduleDate\)/);
  assert.match(main,/class="parking-schedule-detail" href="\/calendar\?month=\$\{esc\(date\.slice\(0,7\)\)\}">일정상세보기 →<\/a>/);
  assert.match(main,/class="parking-schedule-vehicle"><strong>\$\{esc\(record\.plate\)\|\|'차량번호 미입력'\}<\/strong>/);
  assert.match(main,/<\/strong><span class="parking-schedule-manager">\$\{esc\(record\.manager\)\|\|'담당자 미지정'\}<\/span>/);
  assert.match(main,/class="parking-schedule-model">\$\{esc\(record\.model\)\|\|'차종 미입력'\}<\/span>/);
  assert.match(main,/class="parking-schedule-origin">\$\{esc\(record\.origin\)\|\|'탁송출발지역 미입력'\}<\/span>/);
  assert.match(main,/parkingScheduleDeparture\(record\.departure_time\)/);
  assert.match(main,/시 출발예정/);
  const daySchedule=main.slice(main.indexOf('function openParkingDaySchedule('),main.indexOf('function renderParking('));
  assert.doesNotMatch(daySchedule,/customerBadge/);
  assert.match(main,/class="parking-schedule-info" data-parking-schedule-record="\$\{esc\(record\.id\)\}"/);
  assert.match(main,/openCalendarRecord\(record\)/);
  assert.match(main,/Promise\.all\(\[api\('dashboard'\),api\('heydealer'\)\.catch/);
  assert.match(css,/\.parking-mini-calendar\{position:absolute;right:max\(24px,calc\(\(100vw - 1280px\)\/2\)\);top:40px;width:340px;[^}]*background:transparent/);
  assert.match(css,/@media\(max-width:800px\)\{\.parking-mini-calendar\{right:0;top:40px;width:205px/);
  assert.match(css,/\.parking-mini-calendar>strong\{[^}]*font-size:16px/);
  assert.match(css,/\.parking-mini-weekdays span\{[^}]*font-size:12px/);
  assert.match(css,/\.parking-mini-day\{[^}]*font-size:13px/);
  assert.match(css,/\.parking-mini-day>i\{[^}]*border-radius:50%;background:#9aa29d/);
  assert.match(css,/\.parking-mini-day:is\(button\)\{[^}]*background:transparent;cursor:pointer/);
  assert.match(css,/\.parking-schedule-modal ul\{[^}]*overflow-y:auto/);
  assert.match(css,/\.parking-schedule-detail\{position:absolute;top:70px;right:24px/);
  assert.match(css,/\.parking-schedule-vehicle\{display:flex;align-items:center;gap:6px/);
  assert.match(css,/\.parking-schedule-manager\{[^}]*text-overflow:ellipsis/);
  assert.match(css,/\.parking-schedule-model\{flex:0 0 5\.5em;width:5\.5em;max-width:5\.5em/);
  assert.match(css,/grid-template-columns:92px 48px 5em 90px 115px/);
  assert.match(css,/\.parking-schedule-info\{[^}]*border-radius:50%/);
  assert.match(css,/\.parking-schedule-modal li\{gap:4px\}/);
});

test('첫 화면 스프레드시트 아이콘은 바로가기를 유지하고 전체동기화 메뉴를 제공한다',()=>{
  assert.match(main,/function installParkingSheetMenu\(\)/);
  assert.match(main,/menu\.append\(link\)/);
  assert.match(main,/class="header-sheet-submenu"><a href="\$\{link\.href\}"[^`]+>바로가기<\/a><button[^`]+data-parking-sheet-sync>전체동기화<\/button>/);
  assert.match(main,/api\('google-sheets\/sync-all',\{method:'POST',body:JSON\.stringify\(\{tab:tab\.title\}\)\}\)/);
  assert.match(main,/installParkingSheetMenu\(\);/);
  assert.match(css,/\.header-sheet-menu:hover \.header-sheet-submenu,\.header-sheet-menu:focus-within \.header-sheet-submenu/);
});

test('첫 화면 헤드라인과 좌우 일정 도구의 세로 비율을 함께 늘린다',()=>{
  assert.match(css,/\.parking-title \{[^}]*min-height:280px[^}]*padding:63px 24px 107px/);
  assert.match(css,/\.parking-mini-calendar\{[^}]*top:40px.*?\.parking-mini-day,\.parking-mini-empty\{height:33px/s);
  assert.match(css,/\.parking-schedule-checklist\{[^}]*top:40px[^}]*height:236px/);
  assert.match(css,/\.parking-title h1 \{[^}]*transform:translateY\(18px\)/);
  assert.match(css,/\.parking-title \.hero-buttons \{ margin-top:34px; transform:translateY\(18px\); \}/);
});

test('차량 현황판의 주차위치현황 링크는 투명 배경과 테마 글자색을 사용한다',()=>{
  assert.match(css,/body:has\(\.board-page\) \.topbar \.board-nav a\[href="\/"\]\{color:var\(--lime\);background:transparent\}/);
});

test('주차 차량과 상품화 차량을 분리해 다섯 개 통계 카드로 표시한다',()=>{
  assert.match(main,/occupied:parked,productization/);
  assert.match(main,/metric\('주차 차량',c\.occupied,'IN USE','dark'\)\}\$\{metric\('상품화',c\.productization,'PRODUCT','product'\)\}\$\{metric\('빈 자리'/);
  assert.match(css,/\.summary\s*\{[^}]*grid-template-columns:repeat\(5,1fr\)/);
});

test('전체 주차면과 빈 자리 카드는 합계 오른쪽에 층별 자리 수를 줄바꿈해 표시한다',()=>{
  assert.match(main,/totalDetails=floorCounts\.map\(floor=>`\$\{floor\.label\} \$\{String\(floor\.capacity\)\.padStart\(2,'0'\)\}자리`\)\.join\('\\n'\)/);
  assert.match(main,/extraEmpty=zone\.id==='pillar11'\?Math\.min\(5,empty\):0/);
  assert.match(main,/baseEmpty:Math\.max\(0,empty-extraEmpty\),extraEmpty/);
  assert.match(main,/emptyLabel=empty>9\?`\$\{empty-5\}\+5`:empty/);
  assert.match(main,/empty:emptyLabel,emptyFloors:emptyDetails/);
  assert.match(main,/emptyDetails=floorCounts\.map\(floor=>`\$\{floor\.label\} \$\{floor\.id==='pillar11'\?`\$\{floor\.baseEmpty\}\+\$\{floor\.extraEmpty\}`:floor\.empty\}자리`\)\.join\('\\n'\)/);
  assert.match(main,/detail\.match\(\/\^\(\.\*\?\)\\s\+\(\[\\d\+\]\+자리\)\$\//);
  assert.match(main,/parkingCapacityLabel=\(details,spaces\)=>\(\{details,spaces\}\)/);
  assert.match(main,/metric\('전체 주차면',parkingCapacityLabel\(c\.totalFloors,c\.total\)/);
  assert.match(main,/metric\('빈 자리',parkingCapacityLabel\(c\.emptyFloors,c\.empty\)/);
  assert.match(css,/\.metric\.capacity\{[^}]*grid-template-columns:auto minmax\(0,1fr\);align-items:start/);
  assert.match(main,/class="capacity-detail-row"/);
  assert.match(css,/\.metric\.capacity \.metric-details\{[^}]*min-width:88px;width:max-content/);
  assert.match(css,/\.capacity-detail-row\{[^}]*width:100%;grid-template-columns:minmax\(0,1fr\) 6\.5ch;column-gap:3px/);
  assert.match(css,/\.capacity-detail-row>span\{white-space:nowrap\}/);
  assert.match(css,/\.capacity-detail-row>span:first-child\{justify-self:end\}/);
  assert.match(css,/\.capacity-detail-row>span:last-child\{justify-self:end;text-align:right;font-variant-numeric:tabular-nums\}/);
  assert.match(main,/class="empty-capacity-extra"/);
  assert.match(css,/\.metric \.empty-capacity-extra\{display:inline;font-size:\.58em/);
  assert.match(main,/data-capacity-title="\$\{esc\(l\)\}" data-capacity-details="\$\{esc\(metricDetails\)\}" role="button" tabindex="0"/);
  assert.match(main,/matchMedia\('\(max-width: 800px\)'\)\.matches\)showCapacityDetails/);
  assert.match(css,/@media\(max-width:800px\)\{\.metric\.capacity\{display:flex;cursor:pointer\}\.metric\.capacity \.metric-details\{display:none\}\}/);
});

test('확인 필요에 성능일 120일 경과 차량부터 재성능 표시와 함께 집계한다',()=>{
  assert.match(main,/\(today-service\)\/86400000>=120/);
  assert.match(main,/performanceAlerts=activeVehicles\.filter\(s=>isPerformanceOverdue\(s\.reperformanceDate\|\|s\.performanceDate\)\)/);
  assert.match(main,/alertVehicles=new Set\(attentionVehicles\(\)\.map\(s=>s\.vehicleId\|\|s\.id\)\)/);
  assert.match(main,/performanceAlertLabels=c\.performanceAlerts\.map\(s=>`\$\{esc\(String\(s\.plate\)\.slice\(-4\)\)\}\(재성능\)`\)/);
  assert.match(main,/metric\('확인 필요',c\.alerts,'CHECK','amber',performanceAlertLabels\)/);
  assert.match(main,/state\.filter==='alert'&&needsCheck/);
  assert.match(css,/\.metric\.amber \{[^}]*background:var\(--ink\);[^}]*border-color:var\(--ink\)/);
  assert.match(css,/\.metric\.amber \.metric-details \{[^}]*color:#ff8179;[^}]*font-size:12px/);
  assert.match(css,/\.metric\.amber \.metric-details span \{ color:#fff;/);
  assert.match(css,/\.metric\.amber \.metric-details button \{[^}]*color:#ff8179/);
});

test('검색 결과가 많아도 다섯 행 높이 안에서 스크롤한다',()=>{
  assert.match(css,/\.parking-search-results\{[^}]*max-height:335px[^}]*overflow-y:auto/);
});

test('첫 화면 검색 결과는 보조 제목 없이 실제 값을 큰 글씨로 표시한다',()=>{
  assert.doesNotMatch(main,/<small>주차구역<\/small>|<small>차종<\/small>|<small>색상<\/small>|<small>담당자<\/small>|<small>입고날짜<\/small>|<small>특이사항<\/small>/);
  assert.match(css,/\.parking-search-results strong\{font-size:17px\}/);
  assert.match(css,/\.parking-search-results span\{[^}]*font-size:15px[^}]*font-weight:600/);
});

test('새싹타워 검색 결과는 행에 따라 B5층과 B6층을 구분한다',()=>{
  assert.match(main,/import \{normalizePosition,parkingCapacity,parkingLayouts\} from '\.\/parking-layouts\.js'/);
  assert.match(main,/function parkingSearchZoneLabel\(spot\)/);
  assert.match(main,/spot\.zoneId==='tower'/);
  assert.match(main,/row==='01'\)return'새싹 B5층'/);
  assert.match(main,/row==='02'\)return'새싹 B6층'/);
  assert.match(main,/zoneLabel=parkingSearchZoneLabel\(s\)/);
  assert.match(main,/class="parking-search-location">\$\{esc\(zoneLabel\)\|\|'-'\}\$\{s\.isContracted\?'<b>\(계약중\)<\/b>':''\}/);
  assert.match(css,/\.parking-search-location b\{[^}]*color:#c82020/);
  assert.match(main,/checkedInDate=String\(s\.checkedInAt\|\|''\)\.slice\(0,10\),checkedOutDate=String\(s\.checkedOutAt\|\|''\)\.slice\(0,10\)/);
  assert.match(main,/class="parking-search-dates"><time title="입고일">\$\{esc\(checkedInDate\)\|\|'-'\}<\/time>\$\{s\.isCheckedOut\?`<time title="출고일">/);
  assert.match(css,/\.parking-search-dates\{display:grid;gap:2px\}/);
});

test('주차 검색 목록은 네 자리 완전 일치가 아닌 부분검색을 유지한다',()=>{
  assert.match(main,/matches=searchPool\.filter\(s=>used\(s\)&&\[s\.plate,s\.model,s\.color,s\.manager,s\.label,s\.zone\]\.some\(value=>String\(value\)\.toLowerCase\(\)\.includes\(query\)\)\)/);
  assert.doesNotMatch(main,/renderParkingSearchResults\(\)[^}]*endsWith\(query\)/);
});

test('주차 검색 결과가 3대 이하면 클릭 없이 차량 칸을 노란색으로 강조한다',()=>{
  assert.match(main,/if\(matches\.length>0&&matches\.length<=3\)/);
  assert.match(main,/const matchIds=new Set\(matches\.map\(vehicle=>String\(vehicle\.id\)\)\)/);
  assert.match(main,/cell\.classList\.toggle\('search-target',matchIds\.has\(cell\.dataset\.spot\)\)/);
  assert.match(css,/\.parking-cell\.search-target\{[^}]*border:3px solid #ffd21c!important/);
});

test('검색 결과의 상품화 차량은 작업 항목까지 위치에 표시한다',()=>{
  assert.match(main,/if\(spot\.isUnassigned\)return String\(spot\.label\)\.startsWith\('상품화\('\)\?spot\.label:'상품화'/);
});
