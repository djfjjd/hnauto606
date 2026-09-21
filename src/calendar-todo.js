const dateValue=(year,month,day)=>`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

export function parseCalendarTodoPrompt(value,now=new Date()){
  const text=String(value||'').trim();
  const match=text.match(/^(?:날짜\s*)?(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일\s*(?:내용\s*)?([\s\S]*)$/);
  if(!match)return null;
  const year=Number(match[1]||now.getFullYear()),month=Number(match[2]),day=Number(match[3]),content=match[4].trim();
  const parsed=new Date(year,month-1,day);
  if(parsed.getFullYear()!==year||parsed.getMonth()!==month-1||parsed.getDate()!==day)return null;
  return{date:dateValue(year,month,day),content};
}
