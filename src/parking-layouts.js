export const PARKING_COLUMNS=['A','B','C','D','E','F','G','H','I'];

const baseLayout=(name,overrides={})=>({name,columns:9,rows:20,defaultCellType:'parking',parkingRanges:[],specialAreas:[],...overrides});

// 실제 도면을 반영할 때 specialAreas만 수정합니다.
// {from:'A01',to:'C04',type:'company-area',label:'제이카'}처럼 범위를 지정할 수 있습니다.
export const parkingLayouts={
  pillar11:baseLayout('서서울모터리움 6층',{
    rows:21,
    collapseBeforeRow:15,
    defaultCellType:'blocked',
    parkingRanges:[{from:'E15',to:'I20'}],
    specialAreas:[
      {from:'A15',to:'D20',type:'company-area',label:'윤카'},
      {from:'A21',to:'B21',type:'company-area',label:'윤카'},
      {from:'C21',to:'D21',type:'facility',label:'E/V · 화장실'},
      {from:'E21',type:'company-area',label:'제이카'},
      {from:'F21',to:'G21',type:'company-area',label:'픽카소'},
      {from:'H21',to:'I21',type:'office',label:'사무실'},
    ],
  }),
  b3:baseLayout('서서울모터리움 B3층'),
  b5:baseLayout('서서울모터리움 B5층',{
    rows:21,
    collapseBeforeRow:15,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A15',to:'E16'}],
    specialAreas:[
      {from:'A21',to:'B21',type:'blocked',label:''},
      {from:'C21',to:'D21',type:'facility',label:'E/V · 화장실'},
      {from:'E21',to:'I21',type:'blocked',label:''},
    ],
  }),
  roof:baseLayout('서서울모터리움 옥상층',{
    rows:21,
    defaultCellType:'blocked',
    parkingRanges:[
      {from:'E01',to:'I01'},
      {from:'A07',to:'C07'},
      {from:'F08',to:'G08'},
      {from:'A18',to:'C20'},
    ],
    specialAreas:[
      {from:'H03',to:'I07',type:'entrance',label:'주차장 출입구 램프'},
      {from:'A17',to:'C17',type:'parking',label:'A17'},
      {from:'A21',to:'C21',type:'blocked',label:''},
      {from:'D21',type:'stairs',label:'계단'},
      {from:'E21',to:'I21',type:'blocked',label:''},
    ],
  }),
  tower:baseLayout('좋은책신사고 새싹타워'),
  auto13:baseLayout('오토플렉스 13층',{
    collapsedVisibleRows:[9,10,11,19,20],
    toggleBeforeRow:9,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A09',to:'D11'}],
    specialAreas:[
      {from:'A19',to:'B19',type:'facility',label:'화장실'},
      {from:'A20',to:'B20',type:'elevator',label:'E/V'},
    ],
  }),
};

export function normalizePosition(value){
  const match=String(value||'').trim().toUpperCase().match(/^([A-I])0?([1-9]|1\d|2[01])$/);
  return match?`${match[1]}${String(Number(match[2])).padStart(2,'0')}`:'';
}

export function positionParts(value){
  const normalized=normalizePosition(value);
  return normalized?{code:normalized,column:PARKING_COLUMNS.indexOf(normalized[0])+1,row:Number(normalized.slice(1))}:null;
}

export function positionInRanges(code,ranges=[]){
  const position=positionParts(code);
  return Boolean(position&&ranges.some(range=>{const from=positionParts(range.from),to=positionParts(range.to||range.from);return from&&to&&position.column>=Math.min(from.column,to.column)&&position.column<=Math.max(from.column,to.column)&&position.row>=Math.min(from.row,to.row)&&position.row<=Math.max(from.row,to.row);}));
}
