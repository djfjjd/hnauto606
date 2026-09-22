const fixedHolidays=new Set(['01-01','03-01','05-05','06-06','08-15','10-03','10-09','12-25']);
const announcedSubstituteHolidays=new Set(['2026-03-02','2026-05-25','2026-08-17','2026-10-05']);
const lunarFormatter=new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric'});

function lunarMonthDay(date){
  const parts=lunarFormatter.formatToParts(new Date(`${date}T12:00:00+09:00`));
  const month=parts.find(part=>part.type==='month')?.value.replace(/bis$/i,''),day=parts.find(part=>part.type==='day')?.value;
  return month&&day?`${Number(month)}-${Number(day)}`:'';
}

export function isKoreanPublicHoliday(date){
  if(announcedSubstituteHolidays.has(date))return true;
  if(fixedHolidays.has(date.slice(5)))return true;
  return new Set(['12-30','1-1','1-2','4-8','8-14','8-15','8-16']).has(lunarMonthDay(date));
}
