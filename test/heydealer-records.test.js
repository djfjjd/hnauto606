import test from 'node:test';
import assert from 'node:assert/strict';
import {HEYDEALER_RECORDS_KEY,readHeydealerRecords,saveHeydealerRecord} from '../src/heydealer-records.js';

function memoryStorage(){
  const values=new Map();
  return{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
}

test('헤이딜러 거래를 최신순으로 브라우저 저장소에 보관한다',()=>{
  const storage=memoryStorage();
  saveHeydealerRecord({id:'1',plate:'219더4124'},storage);
  saveHeydealerRecord({id:'2',plate:'256조1083'},storage);
  assert.deepEqual(readHeydealerRecords(storage).map(item=>item.id),['2','1']);
  assert.match(storage.getItem(HEYDEALER_RECORDS_KEY),/256조1083/);
});

test('손상된 저장값은 빈 목록으로 안전하게 처리한다',()=>{
  const storage=memoryStorage();
  storage.setItem(HEYDEALER_RECORDS_KEY,'{broken');
  assert.deepEqual(readHeydealerRecords(storage),[]);
});
