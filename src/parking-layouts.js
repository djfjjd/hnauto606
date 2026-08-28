export const PARKING_COLUMNS=['A','B','C','D','E','F','G','H','I'];

const baseLayout=(name)=>({name,columns:9,rows:20,specialAreas:[]});

// 실제 도면을 반영할 때 specialAreas만 수정합니다.
// {from:'A01',to:'C04',type:'company-area',label:'제이카'}처럼 범위를 지정할 수 있습니다.
export const parkingLayouts={
  pillar11:baseLayout('6층'),
  b3:baseLayout('지하 3층'),
  b5:baseLayout('지하 5층'),
  roof:baseLayout('옥상'),
  tower:baseLayout('새싹'),
  auto13:baseLayout('13층'),
};

export function normalizePosition(value){
  const match=String(value||'').trim().toUpperCase().match(/^([A-I])0?([1-9]|1\d|20)$/);
  return match?`${match[1]}${String(Number(match[2])).padStart(2,'0')}`:'';
}

export function positionParts(value){
  const normalized=normalizePosition(value);
  return normalized?{code:normalized,column:PARKING_COLUMNS.indexOf(normalized[0])+1,row:Number(normalized.slice(1))}:null;
}

