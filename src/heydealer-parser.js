const clean=value=>String(value||'').replace(/\u00a0/g,' ').trim();

function nextValue(lines,label,predicate=Boolean){
  const index=lines.findIndex(line=>line===label);
  if(index<0)return'';
  return lines.slice(index+1).find(value=>predicate(value))||'';
}

function valuesAfterLabel(lines,labels,stopLabels){
  const index=lines.findIndex(line=>labels.includes(line));
  if(index<0)return[];
  const values=[];
  for(const line of lines.slice(index+1)){
    if(stopLabels.test(line))break;
    values.push(line);
  }
  return values;
}

function pickupSchedule(lines){
  const pickupIndex=lines.findIndex(line=>/^탁송(?:인수)?\s*정보/.test(line));
  if(pickupIndex<0)return'';
  const section=lines.slice(pickupIndex+1),end=section.findIndex(line=>/^(차대금\s*입금|거래 마무리|거래종결|입금 상태|차대금)$/.test(line)),values=end<0?section:section.slice(0,end);
  const scheduleIndex=values.findIndex(line=>/^(일정|탁송일정|탁송 일정|출발일정|출발 일정|출발 예정시간)$/.test(line));
  if(scheduleIndex>=0)return values[scheduleIndex+1]||'';
  const inline=values.map(line=>line.match(/^(?:탁송\s*)?(?:출발\s*)?일정\s*[:：-]?\s*(.+)$/)).find(Boolean);
  if(inline?.[1])return inline[1];
  return values.find(line=>/(?:\d{4}[-./년]\s*\d{1,2}|오전|오후).*(?:\d{1,2}:\d{2}|\d{1,2}시(?!간)|출발\s*예정)/.test(line))||'';
}

export function parseHeydealerText(raw){
  const lines=String(raw||'').split(/\r?\n/).map(clean).filter(Boolean);
  const platePattern=/\d{2,3}[가-힣]\s?\d{4}/;
  const plateLine=lines.find(line=>platePattern.test(line)&&!line.includes('원부정보'))||lines.find(line=>platePattern.test(line))||'';
  const plate=clean(plateLine.match(platePattern)?.[0]).replace(/\s/g,'');
  const plateIndex=lines.indexOf(plateLine);
  const model=plateIndex<0?'':lines.slice(plateIndex+1).find(line=>line!==plate&&!line.includes('원부정보')&&!/^\d{4}-\d{2}/.test(line)&&!/^\d[\d,]*km$/.test(line))||'';
  const yearLine=lines.find(line=>/^\d{4}-\d{2}\s*\(\d{2}년형\)/.test(line))||'';
  const specLine=lines.find(line=>line.includes('ㆍ')&&/(휘발유|경유|전기|하이브리드|LPG)/i.test(line))||'';
  const specIndex=lines.indexOf(specLine);
  const nextSection=/^(거래 주요정보|원부정보|내 견적|선택날짜|견적 재확인|탁송정보|탁송 정보|탁송인수 정보|차대금 입금|거래 마무리|거래종결|입금 상태|차대금|입금 계좌|안내사항|경매|경매종료|제로|특이사항|출발시간|탁송 출발시간|탁송출발시간)$/;
  const optionCandidate=specIndex<0?'':lines[specIndex+1]||'';
  const labeledOptions=valuesAfterLabel(lines,['옵션'],nextSection);
  const options=(labeledOptions.length?labeledOptions:nextSection.test(optionCandidate)?[]:[optionCandidate]).filter(Boolean).join(',');
  const notes=valuesAfterLabel(lines,['특이사항'],nextSection).join(',');
  const calendarTime=lines.find(line=>/^[A-Za-z]+,\s+[A-Za-z]+\s+\d{1,2}.*·.*\d{1,2}:\d{2}/)||'';
  const departureTime=nextValue(lines,'출발시간')||nextValue(lines,'탁송 출발시간')||nextValue(lines,'탁송출발시간')||pickupSchedule(lines)||calendarTime.split('·')[1]||'';
  const selectedDate=nextValue(lines,'선택날짜',value=>/^\d{4}-\d{2}-\d{2}$/.test(value))||nextValue(lines,'경매종료',value=>/^\d{4}-\d{2}-\d{2}$/.test(value));
  return{
    manager:lines.find(line=>/^[가-힣]{2,5}\s*(대표|대리|주임|과장|부장|사원)$/.test(line))||'',
    modelYear:yearLine.match(/^\d{4}-\d{2}/)?.[0]||'',plate,model,
    color:specLine.split('ㆍ').at(-1)||'',options,notes,
    price:nextValue(lines,'차대금',value=>/[\d,]+만원/.test(value)),
    account:nextValue(lines,'입금 계좌'),
    origin:lines.find(line=>/^[가-힣]+\s+[가-힣]+(?:시|군|구)$/.test(line))||'',
    departureTime,date:selectedDate||'',
  };
}
