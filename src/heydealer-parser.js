const clean=value=>String(value||'').replace(/\u00a0/g,' ').trim();

function nextValue(lines,label,predicate=Boolean){
  const index=lines.findIndex(line=>line===label);
  if(index<0)return'';
  return lines.slice(index+1).find(value=>predicate(value))||'';
}

export function parseHeydealerText(raw){
  const lines=String(raw||'').split(/\r?\n/).map(clean).filter(Boolean);
  const platePattern=/\d{2,3}[가-힣]\s?\d{4}/;
  const plateLine=lines.find(line=>platePattern.test(line)&&!line.includes('원부정보'))||lines.find(line=>platePattern.test(line))||'';
  const plate=clean(plateLine.match(platePattern)?.[0]).replace(/\s/g,'');
  const plateIndex=lines.indexOf(plateLine);
  const model=lines.slice(plateIndex+1).find(line=>line!==plate&&!line.includes('원부정보')&&!/^\d{4}-\d{2}/.test(line)&&!/^\d[\d,]*km$/.test(line))||'';
  const yearLine=lines.find(line=>/^\d{4}-\d{2}\s*\(\d{2}년형\)/.test(line))||'';
  const specLine=lines.find(line=>line.includes('ㆍ')&&/(휘발유|경유|전기|하이브리드|LPG)/i.test(line))||'';
  const specIndex=lines.indexOf(specLine);
  const nextSection=/^(거래 주요정보|내 견적|탁송인수 정보|차대금 입금|입금 상태|차대금|경매|제로)$/;
  const optionCandidate=specIndex<0?'':lines[specIndex+1]||'';
  const options=nextSection.test(optionCandidate)?'':optionCandidate;
  const selectedDate=nextValue(lines,'선택날짜',value=>/^\d{4}-\d{2}-\d{2}$/.test(value))||nextValue(lines,'경매종료',value=>/^\d{4}-\d{2}-\d{2}$/.test(value));
  return{
    manager:lines.find(line=>/^[가-힣]{2,5}\s*(대표|대리|주임|과장|부장|사원)$/.test(line))||'',
    modelYear:yearLine.match(/^\d{4}-\d{2}/)?.[0]||'',plate,model,
    color:specLine.split('ㆍ').at(-1)||'',options,notes:'',
    price:nextValue(lines,'차대금',value=>/[\d,]+만원/.test(value)),
    account:nextValue(lines,'입금 계좌'),
    origin:lines.find(line=>/^[가-힣]+\s+[가-힣]+(?:시|군|구)$/.test(line))||'',
    departureTime:'',date:selectedDate||new Date().toLocaleDateString('en-CA'),
  };
}
