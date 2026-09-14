import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0020_add_business_partners.sql',import.meta.url),'utf8');

test('스프레드시트 아이콘 왼쪽에 거래처 주소 바로가기를 표시한다',()=>{
  assert.match(main,/insertAdjacentHTML\('beforebegin','<a class="header-sheet-link map-shortcut" href="\/map"/);
  assert.match(main,/<img src="\/maps\.jpeg" alt="">/);
});

test('거래처 주소 페이지에서 상호명을 검색하고 거래처를 추가한다',()=>{
  assert.match(main,/async function renderMapPage\(\)/);
  assert.match(main,/placeholder="거래처 상호명 검색"/);
  assert.match(main,/\+ 거래처 추가/);
  assert.doesNotMatch(main,/BUSINESS PARTNERS/);
  assert.doesNotMatch(main,/name="memo"/);
  assert.doesNotMatch(main,/partner\.memo/);
  assert.match(main,/api\('business-partners',\{method:'POST'/);
  assert.match(main,/location\.pathname==='\/map'/);
  assert.match(main,/function installPartnerMapIcons\(\)/);
  assert.match(main,/src="\/kmap\.png"/);
  assert.match(main,/src="\/nmap\.jpeg"/);
  assert.match(main,/src="\/call\.jpeg"/);
  assert.match(main,/href="tel:/);
  assert.match(main,/className='partner-edit-button'/);
  assert.match(main,/method:'PATCH'/);
  assert.match(main,/https:\/\/map\.naver\.com\/p\/search/);
});

test('거래처 상호와 주소를 D1에 저장하고 조회한다',()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS business_partners/);
  assert.match(migration,/name TEXT NOT NULL/);
  assert.match(migration,/address TEXT NOT NULL/);
  assert.match(api,/parts\[0\]==='business-partners'/);
  assert.match(api,/create_business_partner/);
  assert.match(api,/update_business_partner/);
  assert.match(api,/UPDATE business_partners SET name=\?,address=\?,phone=\?,updated_at=CURRENT_TIMESTAMP/);
  assert.match(api,/Business partner audit failed/);
});
