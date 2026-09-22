import {isKoreanPublicHoliday} from './korean-holidays.js';

export function nextCalendarMonth(month){const [year,number]=month.split('-').map(Number);return number===12?`${year+1}-01`:`${year}-${String(number+1).padStart(2,'0')}`;}

export function recurringDate(month,rule){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return'';
  const [year,monthNumber]=month.split('-').map(Number),lastDay=new Date(year,monthNumber,0).getDate();
  let day;
  if(rule.kind==='monthly-day')day=Number(rule.day);
  else if(rule.kind==='last-friday'){day=lastDay;while(new Date(year,monthNumber-1,day).getDay()!==5)day--;}
  else if(rule.kind==='monthly-weekday'){
    const weekday=Number(rule.weekday),ordinal=Number(rule.week_ordinal);
    if(!Number.isInteger(weekday)||weekday<0||weekday>6||!Number.isInteger(ordinal)||ordinal<0||ordinal>5)return'';
    if(ordinal===0){day=lastDay;while(new Date(year,monthNumber-1,day).getDay()!==weekday)day--;}
    else day=1+(weekday-new Date(year,monthNumber-1,1).getDay()+7)%7+7*(ordinal-1);
  }
  else return'';
  if(!Number.isInteger(day)||day<1||(rule.kind==='monthly-day'?day>31:day>lastDay))return'';
  if(rule.kind==='monthly-day')day=Math.min(day,lastDay);
  let date=`${month}-${String(day).padStart(2,'0')}`;
  if(rule.exclude_holidays){let current=new Date(`${date}T12:00:00Z`);while(current.getUTCDay()===0||current.getUTCDay()===6||isKoreanPublicHoliday(date)){current.setUTCDate(current.getUTCDate()-1);date=current.toISOString().slice(0,10);}}
  return date;
}

export function installRecurringCalendarUI({api,esc}){
  const panel=document.querySelector('.calendar-todo'),grid=document.querySelector('[data-calendar-grid]'),controls=document.querySelector('.calendar-controls');
  if(!panel||!grid||!controls||panel.querySelector('[data-recurring-open]'))return;
  const heading=document.createElement('div');heading.className='calendar-todo-heading';heading.innerHTML='<strong>TO DO LIST 일정추가</strong><button type="button" data-recurring-open>+ 반복일정추가</button>';
  panel.querySelector(':scope>strong')?.replaceWith(heading);
  const filters=document.createElement('div');filters.className='calendar-filters';filters.setAttribute('role','group');filters.setAttribute('aria-label','일정 분류');filters.innerHTML=[['all','전체'],['vehicles','입고예정차량'],['todos','To do list'],['recurring','반복일정']].map(([value,label])=>`<button type="button" data-calendar-filter="${value}" class="${value==='all'?'active':''}" aria-pressed="${value==='all'}">${label}</button>`).join('');controls.insertAdjacentElement('afterend',filters);
  let rules=[],filter='all';
  const applyFilter=()=>{grid.querySelectorAll('.calendar-vehicles,.calendar-day-todos,.calendar-day-recurring').forEach(node=>{node.hidden=filter!=='all'&&!node.classList.contains(filter==='vehicles'?'calendar-vehicles':filter==='todos'?'calendar-day-todos':'calendar-day-recurring');});};
  const render=()=>{grid.querySelectorAll('.calendar-day-recurring').forEach(node=>node.remove());const month=document.querySelector('[data-calendar-month]')?.textContent.match(/(\d{4}).*?(\d{2})/)?.slice(1).join('-');if(!month)return;for(const rule of rules){for(const sourceMonth of [month,nextCalendarMonth(month)]){const date=recurringDate(sourceMonth,rule);if(!date.startsWith(month))continue;const day=grid.querySelector(`.calendar-day time[datetime="${date}"]`)?.closest('.calendar-day');if(!day)continue;let list=day.querySelector('.calendar-day-recurring');if(!list){list=document.createElement('div');list.className='calendar-day-recurring';day.append(list);}const button=document.createElement('button');button.type='button';button.className='calendar-recurring-item';button.textContent=rule.content;button.title=rule.kind==='monthly-day'?`매월 ${rule.day}일 · ${rule.content}`:`매월 ${rule.week_ordinal?`${rule.week_ordinal}번째 주`:'마지막 주'} ${['일','월','화','수','목','금','토'][rule.weekday??5]}요일 · ${rule.content}`;button.onclick=()=>openDialog(rule);list.append(button);}}applyFilter();};
  new MutationObserver(render).observe(grid,{childList:true});
  filters.querySelectorAll('button').forEach(button=>button.onclick=()=>{filter=button.dataset.calendarFilter;filters.querySelectorAll('button').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});applyFilter();});
  new MutationObserver(applyFilter).observe(grid,{childList:true,subtree:true});
  const openDialog=(rule=null)=>{
    const backdrop=document.createElement('div'),kind=rule?.kind==='monthly-day'?'monthly-day':'monthly-weekday';backdrop.className='modal-backdrop calendar-recurring-backdrop';
    backdrop.innerHTML=`<section class="modal calendar-recurring-modal" role="dialog" aria-modal="true" aria-labelledby="recurring-title"><button type="button" class="modal-close" data-recurring-close aria-label="닫기">×</button><h2 id="recurring-title">${rule?'반복일정 수정':'반복일정 추가'}</h2><form data-recurring-form><div class="recurring-segments" role="group" aria-label="반복 방식"><button type="button" data-recurring-kind="monthly-day" aria-pressed="${kind==='monthly-day'}">매월 00일</button><button type="button" data-recurring-kind="monthly-weekday" aria-pressed="${kind==='monthly-weekday'}">매월 00번째 주 00요일</button></div><div class="recurring-rule-fields"><span>매월</span><label data-recurring-week><select name="weekOrdinal" aria-label="주차 선택">${[1,2,3,4,0].map(value=>`<option value="${value}" ${Number(rule?.week_ordinal??(rule?.kind==='last-friday'?0:1))===value?'selected':''}>${value?`${value}번째 주`:'마지막 주'}</option>`).join('')}</select></label><label data-recurring-weekday><select name="weekday" aria-label="요일 선택">${['일','월','화','수','목','금','토'].map((name,index)=>`<option value="${index}" ${Number(rule?.weekday??5)===index?'selected':''}>${name}요일</option>`).join('')}</select></label><label class="recurring-day-input" data-recurring-day><input type="number" name="day" aria-label="날짜 입력" min="1" max="31" inputmode="numeric" value="${rule?.day||1}" required><span aria-hidden="true">일</span></label></div><label class="recurring-exclude"><input type="checkbox" name="excludeHolidays" ${rule?.exclude_holidays?'checked':''}>주말 및 공휴일 제외 (전 영업일로 당기기)</label><label>내용<input name="content" maxlength="500" value="${esc(rule?.content||'')}" required></label><p role="status"></p><div class="calendar-recurring-actions">${rule?'<button type="button" class="danger" data-recurring-delete>삭제</button>':''}<button type="submit" class="primary">저장</button></div></form></section>`;
    document.body.append(backdrop);const form=backdrop.querySelector('form'),status=backdrop.querySelector('[role="status"]'),close=()=>backdrop.remove();let selectedKind=kind;const sync=()=>{backdrop.querySelectorAll('[data-recurring-kind]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.recurringKind===selectedKind)));backdrop.querySelectorAll('[data-recurring-week],[data-recurring-weekday]').forEach(field=>field.hidden=selectedKind!=='monthly-weekday');const dayField=backdrop.querySelector('[data-recurring-day]');dayField.hidden=selectedKind!=='monthly-day';form.elements.day.disabled=selectedKind!=='monthly-day';form.elements.weekOrdinal.disabled=selectedKind!=='monthly-weekday';form.elements.weekday.disabled=selectedKind!=='monthly-weekday';};backdrop.querySelectorAll('[data-recurring-kind]').forEach(button=>button.onclick=()=>{selectedKind=button.dataset.recurringKind;sync();});sync();backdrop.querySelector('[data-recurring-close]').onclick=close;backdrop.onclick=event=>{if(event.target===backdrop)close();};
    form.onsubmit=async event=>{event.preventDefault();const button=form.querySelector('[type=submit]'),payload={kind:selectedKind,day:selectedKind==='monthly-day'?Number(form.elements.day.value):null,weekOrdinal:selectedKind==='monthly-weekday'?Number(form.elements.weekOrdinal.value):null,weekday:selectedKind==='monthly-weekday'?Number(form.elements.weekday.value):null,excludeHolidays:form.elements.excludeHolidays.checked,content:form.elements.content.value.trim()};button.disabled=true;try{const result=await api(`calendar-recurring${rule?`/${rule.id}`:''}`,{method:rule?'PATCH':'POST',body:JSON.stringify(payload)});rules=rule?rules.map(item=>item.id===rule.id?result.rule:item):[...rules,result.rule];render();close();}catch(error){status.textContent=error.message;button.disabled=false;}};
    backdrop.querySelector('[data-recurring-delete]')?.addEventListener('click',async event=>{if(!confirm('이 반복일정을 삭제할까요?'))return;event.currentTarget.disabled=true;try{await api(`calendar-recurring/${rule.id}`,{method:'DELETE'});rules=rules.filter(item=>item.id!==rule.id);render();close();}catch(error){status.textContent=error.message;event.currentTarget.disabled=false;}});form.elements.content.focus();
  };
  heading.querySelector('[data-recurring-open]').onclick=()=>openDialog();
  api('calendar-recurring').then(data=>{rules=data.rules||[];render();}).catch(error=>{const status=panel.querySelector('.calendar-todo-status');if(status)status.textContent=error.message;});
}
