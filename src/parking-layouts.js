export const PARKING_COLUMNS=['A','B','C','D','E','F','G','H','I','J','K','L','M'];

const baseLayout=(name,overrides={})=>({name,columns:9,rows:20,defaultCellType:'parking',parkingRanges:[],specialAreas:[],...overrides});
const towerB5ParkingOrder=[...Array.from({length:5},(_,index)=>`D${String(index+4).padStart(2,'0')}`),...Array.from({length:11},(_,index)=>`A${String(12-index).padStart(2,'0')}`),...PARKING_COLUMNS.slice(1,12).map(column=>`${column}01`),...Array.from({length:7},(_,index)=>`M${String(index+2).padStart(2,'0')}`),...Array.from({length:5},(_,index)=>`J${String(8-index).padStart(2,'0')}`)];
const towerB6ParkingOrder=[...Array.from({length:5},(_,index)=>`D${index+17}`),...Array.from({length:11},(_,index)=>`A${25-index}`),...PARKING_COLUMNS.slice(1,7).map(column=>`${column}14`)];
const towerUnavailablePositions=new Set([...Array.from({length:11},(_,index)=>`A${String(index+2).padStart(2,'0')}`),'D04','D05','D06','B01','C01','D01','G01','H01','M08','A15','A18','J04','J05','J06','J07','J08']);
const towerCollapsedGroups={B5:towerB5ParkingOrder.filter(position=>!towerUnavailablePositions.has(position)),B6:towerB6ParkingOrder.filter(position=>!towerUnavailablePositions.has(position))};

// 실제 도면을 반영할 때 specialAreas만 수정합니다.
// {from:'A01',to:'C04',type:'company-area',label:'제이카'}처럼 범위를 지정할 수 있습니다.
export const parkingLayouts={
  pillar11:baseLayout('서서울모터리움 6층',{
    rows:21,
    collapseBeforeRow:15,
    defaultCellType:'blocked',
    parkingRanges:[{from:'E15',to:'I20'}],
    tintedRanges:[{from:'E15',to:'I15'}],
    specialAreas:[
      {from:'A15',to:'D20',type:'company-area',label:'윤카',borderless:true},
      {from:'A21',to:'B21',type:'company-area',label:'윤카',borderless:true},
      {from:'C21',to:'D21',type:'facility',label:'E/V · 화장실'},
      {from:'E21',type:'company-area',label:'제이카',borderless:true},
      {from:'F21',to:'G21',type:'company-area',label:'픽카소',borderless:true},
      {from:'H21',to:'I21',type:'office',label:'사무실'},
    ],
  }),
  b3:baseLayout('서서울모터리움 B3층',{
    startColumn:3,
    columns:7,
    rows:21,
    collapsedVisibleRows:[17,21],
    toggleBeforeRow:16,
    defaultCellType:'blocked',
    parkingRanges:[{from:'E17',to:'I17'}],
    specialAreas:[
      {from:'A21',to:'C21',type:'blocked',label:''},
      {from:'D21',to:'E21',type:'facility',label:'E/V · 화장실'},
      {from:'F21',to:'I21',type:'blocked',label:''},
    ],
  }),
  b5:baseLayout('서서울모터리움 B5층',{
    columns:7,
    rows:21,
    collapsedVisibleRows:[14,15,16,17,21],
    toggleBeforeRow:15,
    defaultCellType:'blocked',
    parkingRanges:[{from:'A15',to:'F16'}],
    specialAreas:[
      {from:'A21',to:'C21',type:'blocked',label:''},
      {from:'D21',to:'E21',type:'facility',label:'E/V · 화장실'},
      {from:'F21',to:'G21',type:'blocked',label:''},
    ],
  }),
  roof:baseLayout('서서울모터리움 옥상층',{
    rows:20,
    collapsedVisibleRows:[1,2,3,4,5,6,7,8,17,18,19,20],
    toggleBeforeRow:9,
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
      {from:'D17',to:'E20',type:'stairs',label:'계단'},
    ],
  }),
  tower:baseLayout('좋은책신사고 새싹타워',{
    columns:10,
    expandedColumns:13,
    rows:25,
    hiddenRows:[13],
    collapsedVisibleRows:[1,2],
    collapsedColumns:7,
    collapsedGroups:towerCollapsedGroups,
    collapsedGroupColumns:{B5:7,B6:5},
    collapsedVisibleLimit:20,
    collapsedHideColumnHeaders:true,
    defaultCellType:'blocked',
    collapsedParkingRanges:[{from:'A01',to:'J02'}],
    parkingRanges:[
      {from:'D07',to:'D08'},
      {from:'E01',to:'F01'},
      {from:'I01',to:'L01'},
      {from:'M02',to:'M07'},
      {from:'B14',to:'G14'},
      {from:'A16',to:'A17'},
      {from:'A19',to:'A25'},
      {from:'D17',to:'D21'},
    ],
    unavailableRanges:[
      {from:'A02',to:'A12'},
      {from:'D04',to:'D06'},
      {from:'B01',to:'D01'},
      {from:'G01',to:'H01'},
      {from:'M08'},
      {from:'J04',to:'J08'},
      {from:'A15'},
      {from:'A18'},
    ],
    specialAreas:[
      {from:'E04',to:'I08',type:'facility',label:'E/V'},
      {from:'D09',to:'M12',type:'entrance',label:'주차장 출입구 램프'},
      {from:'E17',to:'I21',type:'facility',label:'E/V'},
      {from:'J14',to:'M21',type:'blocked',label:''},
      {from:'D22',to:'M25',type:'entrance',label:'주차장 출입구 램프'},
    ],
    sectionBorders:[{from:'A01',to:'M12'},{from:'A14',to:'M25'}],
    cellWidth:58,
    rowLabelWidth:42,
  }),
};

export function normalizePosition(value){
  const match=String(value||'').trim().toUpperCase().match(/^([A-M])0?([1-9]|1\d|2[0-6])$/);
  return match?`${match[1]}${String(Number(match[2])).padStart(2,'0')}`:'';
}

export function towerParkingLabel(value){
  const position=normalizePosition(value),b5Index=towerB5ParkingOrder.indexOf(position),b6Index=towerB6ParkingOrder.indexOf(position);
  if(b5Index>=0)return`B5층 ${String(b5Index+(b5Index<5?1:2)).padStart(2,'0')}`;
  if(b6Index>=0)return`B6층 ${String(b6Index+1).padStart(2,'0')}`;
  return'';
}

export function positionParts(value){
  const normalized=normalizePosition(value);
  return normalized?{code:normalized,column:PARKING_COLUMNS.indexOf(normalized[0])+1,row:Number(normalized.slice(1))}:null;
}

export function positionInRanges(code,ranges=[]){
  const position=positionParts(code);
  return Boolean(position&&ranges.some(range=>{const from=positionParts(range.from),to=positionParts(range.to||range.from);return from&&to&&position.column>=Math.min(from.column,to.column)&&position.column<=Math.max(from.column,to.column)&&position.row>=Math.min(from.row,to.row)&&position.row<=Math.max(from.row,to.row);}));
}

export function parkingCapacity(layout){
  let total=0;
  const startColumn=layout.startColumn||1,columns=layout.expandedColumns||layout.columns,hiddenRows=new Set(layout.hiddenRows||[]);
  for(let row=1;row<=layout.rows;row+=1){
    if(hiddenRows.has(row))continue;
    for(let column=startColumn;column<startColumn+columns;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`;
      const area=layout.specialAreas.find(item=>positionInRanges(code,[item]));
      if(area){
        if(area.type==='parking'&&normalizePosition(area.from)===code)total+=1;
        continue;
      }
      if(layout.defaultCellType==='parking'||positionInRanges(code,layout.parkingRanges))total+=1;
    }
  }
  return total;
}
