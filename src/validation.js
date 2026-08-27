export const ROLES=['admin','staff','viewer'];
export const STATUSES=['battery','fuel','key','engine','tire','urea','other'];
export function normalizePlate(value){return String(value||'').replace(/\s+/g,'').toUpperCase();}
export function validateVehicle(input){const plate=normalizePlate(input?.plate);if(!/^[0-9]{2,3}[가-힣][0-9]{4}$/.test(plate))return{ok:false,message:'차량번호 형식을 확인해 주세요.'};if(String(input?.model||'').length>80||String(input?.color||'').length>30||String(input?.memo||'').length>500)return{ok:false,message:'입력 가능한 글자 수를 초과했습니다.'};return{ok:true,value:{plate,model:String(input.model||'').trim(),color:String(input.color||'').trim(),memo:String(input.memo||'').trim()}};}
export function canWrite(role){return role==='admin'||role==='staff';}
