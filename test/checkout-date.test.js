import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('출고 팝업은 오늘 날짜를 기본값으로 하는 수정 가능한 출고일을 제공한다',()=>{
  assert.match(main,/function checkoutForm\(\)\{const today=new Date\(\)\.toLocaleDateString\('en-CA'\)/);
  assert.match(main,/type="date" name="checkedOutDate" value="\$\{today\}" required/);
  assert.match(main,/JSON\.stringify\(\{checkedOutDate\}\)/);
});

test('출고 API는 출고일을 검증해 차량과 감사 이력에 저장한다',()=>{
  assert.match(api,/checkedOutDate=validDate\(input\?\.checkedOutDate\)/);
  assert.match(api,/checked_out_at=\?/);
  assert.match(api,/JSON\.stringify\(\{checkedOutDate\}\)/);
});
