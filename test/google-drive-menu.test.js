import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');

test('상단 헤이딜러 메뉴는 프롬프트·목록만 표시하고 Drive 아이콘은 밖에 둔다',()=>{
  assert.match(main,/class="external-menu drive-menu"/);
  assert.match(main,/data-drive-menu aria-expanded="false">헤이딜러/);
  assert.match(main,/class="external-submenu"><a href="\/drive">프롬프트양식<\/a>/);
  assert.match(main,/<a href="\/drive\/heydealer">선택차량목록<\/a>/);
  assert.match(main,/class="drive-shortcut drive-icon-link" href="https:\/\/docs\.google\.com\/spreadsheets\/d\/1N3cAmPeS7eOZoqW-k9r1bx_xI0XI-4e0aGo9B04wGbA\/edit\?gid=1361663048#gid=1361663048"[^>]*aria-label="Google Sheets 바로가기"[^>]*><img src="\/sheets\.png" alt=""><\/a>/);
  assert.match(main,/class="external-submenu"><a href="\/drive">프롬프트양식<\/a><a href="\/drive\/heydealer">선택차량목록<\/a><\/div>/);
  assert.match(css,/\.external-tools>a:not\(\.drive-icon-link\)\{font-size:15px\}\.external-tools>\.external-menu>button\{font-size:16px\}/);
  assert.match(css,/\.drive-shortcut img\{width:30px;height:30px;aspect-ratio:460\/460;border-radius:50%;object-fit:cover/);
  assert.match(css,/\.external-tools \.drive-icon-link\{width:36px;height:36px;[^}]*border-radius:50%;background:transparent;overflow:hidden/);
  assert.match(css,/\.external-menu:hover \.external-submenu/);
  assert.match(css,/\.external-menu:focus-within \.external-submenu/);
  assert.ok(main.indexOf('>헤이딜러</button>')<main.indexOf('>새싹타워정기권</a>'));
  assert.ok(main.indexOf('>새싹타워정기권</a>')<main.indexOf('>엔카진단예약</a>'));
  assert.ok(main.indexOf('>엔카진단예약</a>')<main.indexOf('class="drive-shortcut drive-icon-link"'));
});

test('헤이딜러 버튼은 프롬프트양식으로 이동하고 키보드 Escape 조작을 지원한다',()=>{
  assert.match(main,/button\.onclick=\(\)=>\{location\.href='\/drive';\}/);
  assert.match(main,/if\(event\.key==='Escape'\)/);
  assert.match(css,/\.drive-menu>button:hover\+\.external-submenu a:first-child,[^{]*\{text-decoration:underline;text-underline-offset:4px\}/);
});

test('헤이딜러 페이지 상단은 차량 현황판 링크만 표시한다',()=>{
  assert.match(css,/body:has\(\.drive-prompt-panel\) \.topbar \.board-nav a\[href="\/"\][^,]*,body:has\(\.heydealer-list-page\) \.topbar \.board-nav a\[href="\/drive"\]\{display:none\}/);
  assert.match(css,/body:has\(\.drive-prompt-panel\) \.topbar \.board-nav a\[href="\/dashboard"\][^{]*\{[^}]*background:var\(--lime\)/);
  assert.match(css,/body:has\(\.heydealer-list-page\) \.topbar \.board-nav a\[href="\/dashboard"\][^{]*\{[^}]*background:var\(--lime\)/);
});

test('/drive 경로에 Google API 연결 전 안전한 프롬프트 화면을 제공한다',()=>{
  assert.match(main,/function renderDrivePage\(\)/);
  assert.match(main,/class="drive-prompt-panel"/);
  assert.doesNotMatch(main,/class="drive-prompt-panel"><p class="eyebrow">GOOGLE DRIVE<\/p><h1>구글드라이브<\/h1>/);
  assert.match(main,/id="drive-prompt"[^>]*maxlength="12000"/);
  assert.match(main,/parseHeydealerText\(prompt\.value\)/);
  assert.match(main,/driveField\('manager','담당자'\)/);
  assert.match(main,/driveField\('departureTime','출발시간'\)/);
  assert.match(main,/id="drive-payment-prompt"/);
  assert.match(main,/\(탁송인수 정보\)/);
  assert.match(main,/\(차대금 입금\)/);
  assert.match(main,/mergeParsed\(parsed\)/);
  assert.doesNotMatch(main,/거래 정보는 D1에 저장되며 법인 첨부파일은 비공개 R2에 보관됩니다/);
  assert.match(main,/class="drive-prompt-title">헤이딜러 거래 화면 전체를 아래 프롬프트에 붙여넣으면 거래 정보가 자동 입력됩니다/);
  assert.match(main,/data-sheet-tab hidden aria-hidden="true"/);
  assert.doesNotMatch(main,/sheet-sync-target/);
  assert.doesNotMatch(main,/구글드라이브 바로가기/);
  assert.match(main,/loadGoogleSheetTabs\(sheetSelect,status,true\)/);
  assert.match(main,/location\.pathname==='\/drive'/);
  assert.match(css,/\.drive-prompt-panel\{/);
  assert.match(css,/\.drive-prompt-grid\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css,/\.drive-prompt-title\{color:#111/);
});

test('헤이딜러 입력은 초기화와 저장을 지원하고 목록 페이지에서 확인한다',()=>{
  assert.match(main,/data-drive-reset>초기화/);
  assert.match(main,/data-drive-save>저장/);
  assert.match(main,/drive-saving-label/);
  assert.match(main,/status\.textContent='저장 중'/);
  assert.match(main,/await api\('heydealer'/);
  assert.match(main,/uploadHeydealerFile\(savedRecordId,corporateFile\)/);
  assert.match(main,/location\.href='\/drive\/heydealer'/);
  assert.match(main,/function renderHeydealerRecordsPage\(\)/);
  assert.match(main,/location\.pathname==='\/drive\/heydealer'/);
  assert.match(main,/<div class="heydealer-list-head"><h1>선택차량목록<\/h1><div class="heydealer-list-actions"><button type="button" data-sheet-sync-all disabled>전체 동기화<\/button><a href="\/drive">\+ 새 거래 입력<\/a>/);
  assert.match(main,/await loadGoogleSheetTabs\(sheetSelect,syncStatus,true\);syncAllButton\.disabled=!sheetSelect\.value/);
  assert.match(main,/<select data-sheet-tab hidden aria-hidden="true" disabled>/);
  assert.doesNotMatch(main,/class="sheet-bulk-sync"/);
  assert.match(css,/\.heydealer-list-actions\{display:flex/);
  assert.doesNotMatch(main,/GOOGLE DRIVE · HEYDEALER|헤이딜러 저장 목록|거래 정보는 D1, 법인 첨부파일은 비공개 R2에 저장됩니다/);
  assert.match(css,/\.heydealer-record-list\{/);
});

test('특이사항은 필수 개인·법인 선택이며 법인만 파일 첨부를 활성화한다',()=>{
  assert.match(main,/driveField\('notes','특이사항'\)/);
  assert.match(main,/required-mark">\(필수\)<\/small>/);
  assert.match(main,/<option value="개인">개인<\/option><option value="법인">법인<\/option>/);
  assert.match(main,/name="corporateFile"[^>]*disabled/);
  assert.match(main,/const enabled=customerSelect\.value==='법인'/);
  assert.match(main,/fileInput\.disabled=!enabled/);
  assert.match(main,/>📎<\/span><b>파일 업로드<\/b>/);
  assert.match(css,/\.drive-file-button\.is-disabled/);
});

test('프롬프트 입력은 특이사항 개인·법인 선택값을 자동 변경하지 않는다',()=>{
  assert.match(main,/if\(name==='notes'\)return;const field=form\.elements\.namedItem\(name\)/);
  assert.match(main,/const reset=\(\)=>\{savedRecordId='';fileUploaded=false;fillDriveFields\(form,empty\)/);
});

test('헤이딜러 거래는 옵션만 선택이고 나머지 입력값을 필수로 검증한다',()=>{
  assert.match(main,/const required=name!=='options'/);
  assert.doesNotMatch(main,/driveField\('date','날짜'/);
  assert.match(main,/driveField\('mileage','총 주행거리'\)/);
  assert.match(main,/requiredNames=\['manager','modelYear','plate','model','color','mileage','notes','price','account','origin','departureTime'\]/);
  assert.match(main,/status\.textContent='필수사항을 입력하세요\.'/);
  assert.match(main,/status\.classList\.add\('is-error'\)/);
  assert.match(css,/\.drive-parse-status\{[^}]*text-align:right/);
  assert.match(css,/\.drive-prompt-panel>\.drive-parse-status\.is-error\{color:#c82020/);
});

test('선택차량목록은 기본 접힘·10개 페이지·삭제 기능을 제공한다',()=>{
  assert.match(main,/class="heydealer-record-details"><summary>펼치기<\/summary>/);
  assert.match(main,/records\.slice\(\(currentPage-1\)\*10,currentPage\*10\)/);
  assert.match(main,/>맨처음<\/button>/);
  assert.match(main,/>맨끝<\/button>/);
  assert.match(main,/data-heydealer-delete/);
  assert.match(main,/api\(`heydealer\/\$\{record\.id\}`,\{method:'DELETE'\}\)/);
  assert.match(css,/\.heydealer-delete\{[^}]*color:#c82020/);
});
