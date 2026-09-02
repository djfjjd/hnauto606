import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHeydealerText} from '../src/heydealer-parser.js';

const sample=`경매장
하성은 대표
219더4124

BMW 1시리즈 (F40) 120i M 스포츠
2023-10 (23년형)
18,634km
경남 창원시
휘발유ㆍ오토ㆍ현금/할부ㆍ알파인 화이트

거래 주요정보
내 견적
2,420만원
선택날짜
2026-09-01
차대금
2,420만원
입금 계좌
우리은행 296-969767-18-810 (예금주: (주)피알앤디컴퍼니)`;

test('헤이딜러 전체 복사문에서 거래 입력값을 추출한다',()=>{
  assert.deepEqual(parseHeydealerText(sample),{
    manager:'하성은 대표',modelYear:'2023-10',plate:'219더4124',
    model:'BMW 1시리즈 (F40) 120i M 스포츠',color:'알파인 화이트',options:'',notes:'',
    price:'2,420만원',account:'우리은행 296-969767-18-810 (예금주: (주)피알앤디컴퍼니)',
    origin:'경남 창원시',departureTime:'',date:'2026-09-01',
  });
});

test('제원 바로 아래의 옵션 문구를 자동 입력한다',()=>{
  const result=parseHeydealerText(sample.replace('\n거래 주요정보','\n선루프,1인신조\n거래 주요정보'));
  assert.equal(result.options,'선루프,1인신조');
});
