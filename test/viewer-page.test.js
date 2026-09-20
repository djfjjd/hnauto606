import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const main=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');

test('/view는 인증 전에 공개 조회 데이터를 불러온다',()=>{
  assert.match(main,/if\(VIEWER_MODE\)\{await loadViewer\(\);return;\}/);
  assert.match(handler,/parts\.join\('\/'\)==='viewer\/dashboard'[\s\S]*?const auth=await requireUser\(request,env,method!=='GET'\)/);
});

test('/view는 검색을 제외한 주차 조작과 이동을 비활성화한다',()=>{
  assert.match(main,/removeAttribute\('draggable'\)/);
  assert.match(main,/clone\.querySelectorAll\('button,\[data-spot\]'\)/);
  assert.match(main,/if\(VIEWER_MODE\)return;panel\.querySelectorAll/);
});
