import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const handler=readFileSync(new URL('../functions/api/[[path]].js',import.meta.url),'utf8');
const migration=readFileSync(new URL('../migrations/0013_add_heydealer_records.sql',import.meta.url),'utf8');
const mileageMigration=readFileSync(new URL('../migrations/0014_add_heydealer_mileage.sql',import.meta.url),'utf8');
const customerTypeMigration=readFileSync(new URL('../migrations/0017_add_non_business_corporate_type.sql',import.meta.url),'utf8');
const pendingTypeMigration=readFileSync(new URL('../migrations/0022_add_pending_customer_type.sql',import.meta.url),'utf8');
const wrangler=readFileSync(new URL('../wrangler.toml',import.meta.url),'utf8');

test('헤이딜러 거래와 파일 메타데이터를 별도 D1 테이블에 보관한다',()=>{
  assert.match(migration,/CREATE TABLE IF NOT EXISTS heydealer_records/);
  assert.match(migration,/customer_type TEXT NOT NULL CHECK\(customer_type IN \('개인','법인'\)\)/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS heydealer_files/);
  assert.match(migration,/record_id TEXT NOT NULL REFERENCES heydealer_records\(id\) ON DELETE CASCADE/);
  assert.match(handler,/INSERT INTO heydealer_records/);
  assert.match(handler,/INSERT INTO heydealer_files/);
});

test('개인 외 거래 파일만 비공개 R2에 저장하고 실패 시 객체를 정리한다',()=>{
  assert.match(wrangler,/binding = "FILES"[\s\S]*bucket_name = "hnauto606-private-files"/);
  assert.match(handler,/\['비사업용','간이과세자','법인'\]\.includes\(record\.customer_type\)/);
  assert.match(handler,/file\.size>20\*1024\*1024/);
  assert.match(handler,/await env\.FILES\.put\(objectKey/);
  assert.match(handler,/await env\.FILES\.delete\(objectKey\)/);
  assert.match(handler,/Content-Disposition/);
  assert.match(handler,/filename\*=UTF-8''\$\{encodeURIComponent\(file\.filename\)\}/);
});

test('기존 법인 비사업용 마이그레이션 이력을 보존한다',()=>{
  assert.match(customerTypeMigration,/customer_type TEXT NOT NULL CHECK\(customer_type IN \('개인','법인','법인\(비사업용\)'\)\)/);
  assert.match(handler,/\['개인','비사업용','간이과세자','법인','확인중'\]\.includes\(customerType\)/);
});

test('거래유형을 네 종류로 저장하고 기존 법인 비사업용을 변환한다',()=>{
  const migration=readFileSync(new URL('../migrations/0019_update_customer_types.sql',import.meta.url),'utf8');
  assert.match(handler,/\['개인','비사업용','간이과세자','법인','확인중'\]\.includes\(customerType\)/);
  assert.match(migration,/customer_type IN \('개인','비사업용','간이과세자','법인'\)/);
  assert.match(migration,/WHEN customer_type='법인\(비사업용\)' THEN '비사업용'/);
});

test('특이사항 확인중 값을 저장할 수 있도록 스키마를 확장한다',()=>{
  assert.match(pendingTypeMigration,/customer_type IN \('개인','비사업용','간이과세자','법인','확인중'\)/);
});

test('이미지 첨부파일은 캘린더 미리보기에서 inline으로 연다',()=>{
  assert.match(handler,/url\.searchParams\.get\('inline'\)==='1'/);
  assert.match(handler,/\$\{inline\?'inline':'attachment'\}; filename\*=UTF-8/);
});

test('헤이딜러 API는 옵션 외 모든 거래 항목을 필수로 검증한다',()=>{
  assert.match(mileageMigration,/ALTER TABLE heydealer_records ADD COLUMN mileage TEXT NOT NULL DEFAULT ''/);
  assert.match(handler,/requiredValues=\[input\?\.manager,input\?\.modelYear,input\?\.plate,input\?\.model,input\?\.color,input\?\.mileage,input\?\.customerType\|\|input\?\.notes,input\?\.price,input\?\.account,input\?\.origin,input\?\.departureTime\]/);
  assert.match(handler,/message:'필수사항을 입력하세요\.'/);
});

test('잘못 입력한 선택 차량은 R2 파일과 D1 기록을 안전하게 삭제한다',()=>{
  assert.match(handler,/method==='DELETE'&&parts\[1\]&&!parts\[2\]/);
  assert.match(handler,/for\(const file of files\)await env\.FILES\.delete\(file\.object_key\)/);
  assert.match(handler,/DELETE FROM heydealer_files WHERE record_id=\?/);
  assert.match(handler,/DELETE FROM heydealer_records WHERE id=\?/);
  assert.match(handler,/'delete','heydealer_record'/);
});

test('입고완료 선택 차량은 계약 상태에는 유지되고 실제 출고 후 목록에서 제외된다',()=>{
  assert.match(handler,/checkedOut="EXISTS\(SELECT 1 FROM vehicles v WHERE replace\(v\.plate,' ',''\)=replace\(h\.plate,' ',''\) AND v\.checked_out_at IS NOT NULL\)"/);
  assert.match(handler,/\['transit','completed','index'\]/);
  assert.match(handler,/WHERE \(\?='index' AND \$\{checkedOut\}\) OR \(\?<>'index' AND NOT \$\{checkedOut\}/);
});
