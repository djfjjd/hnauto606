import {PARKING_COLUMNS,normalizePosition,positionInRanges,positionParts} from './parking-layouts.js';

const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const lastFour=plate=>String(plate||'').slice(-4);

function areaBounds(area){
  const from=positionParts(area.from),to=positionParts(area.to||area.from);
  return from&&to?{column:Math.min(from.column,to.column),row:Math.min(from.row,to.row),columnSpan:Math.abs(to.column-from.column)+1,rowSpan:Math.abs(to.row-from.row)+1}:null;
}

function areaAt(layout,column,row){
  return layout.specialAreas.map(area=>({area,bounds:areaBounds(area)})).find(({bounds})=>bounds&&column>=bounds.column&&column<bounds.column+bounds.columnSpan&&row>=bounds.row&&row<bounds.row+bounds.rowSpan);
}

function parkingCell(code,spot,visible,column,gridRow,columnSpan=1,rowSpan=1){
  const position=`grid-column:${column+1}/span ${columnSpan};grid-row:${gridRow}/span ${rowSpan}`;
  if(!spot)return`<div class="parking-cell is-vacant is-virtual" style="${position}" role="gridcell" aria-label="${code} 빈 자리"><small>${code}</small><strong>빈 자리</strong><span>주차 가능</span></div>`;
  const occupied=Boolean(spot.plate),alert=occupied&&spot.alerts?.length,classes=['parking-cell',occupied?'is-occupied':'is-vacant',alert?'has-alert':'',visible?'':'is-filtered'].filter(Boolean).join(' ');
  return`<button class="${classes}" data-spot="${escapeHtml(spot.id)}" style="${position}" role="gridcell" aria-label="${code} ${occupied?`${spot.plate} 주차 중`:'빈 자리'}"><small>${code}</small>${alert?'<i aria-hidden="true">!</i>':''}<strong>${occupied?escapeHtml(lastFour(spot.plate)):'빈 자리'}</strong>${occupied?`<span>${escapeHtml(spot.model||'차량')}</span>`:'<span>주차 가능</span>'}</button>`;
}

function blockedCell(code,column,gridRow){
  return`<div class="parking-cell is-layout-blocked" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비주차 구역"><small>${code}</small></div>`;
}

export function renderParkingMap(layout,spots,visibleIds=new Set(spots.map(spot=>spot.id)),options={}){
  const byPosition=new Map(spots.map(spot=>[normalizePosition(spot.label),spot]));
  const collapsed=Boolean(layout.collapseBeforeRow&&!options.expanded),visibleRows=Array.from({length:layout.rows},(_,index)=>index+1).filter(row=>!collapsed||row>=layout.collapseBeforeRow),hasToggle=Boolean(layout.collapseBeforeRow),gridRowByActual=new Map(visibleRows.map((row,index)=>[row,index+2+(hasToggle&&row>=layout.collapseBeforeRow?1:0)])),cells=[];
  cells.push('<span class="map-corner" style="grid-column:1;grid-row:1" aria-hidden="true"></span>',...PARKING_COLUMNS.slice(0,layout.columns).map((column,index)=>`<b class="map-column" style="grid-column:${index+2};grid-row:1" aria-hidden="true">${column}</b>`));
  if(hasToggle){
    const toggleRow=visibleRows.filter(row=>row<layout.collapseBeforeRow).length+2;
    cells.push(`<button class="map-row-toggle" style="grid-column:1/span ${layout.columns+1};grid-row:${toggleRow}" data-toggle-map="${escapeHtml(options.zoneId||'')}" aria-expanded="${options.expanded?'true':'false'}"><span aria-hidden="true">${options.expanded?'▲':'▼'}</span> ${options.expanded?'접기':'펼치기'}</button>`);
  }
  for(const row of visibleRows){
    const gridRow=gridRowByActual.get(row);
    cells.push(`<b class="map-row" style="grid-column:1;grid-row:${gridRow}" aria-hidden="true">${String(row).padStart(2,'0')}</b>`);
    for(let column=1;column<=layout.columns;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`,match=areaAt(layout,column,row);
      if(match){
        if(column!==match.bounds.column||row!==match.bounds.row)continue;
        const areaGridRow=gridRowByActual.get(match.bounds.row);
        if(!areaGridRow)continue;
        if(match.area.type==='parking'){
          const spot=byPosition.get(normalizePosition(match.area.from));
          cells.push(parkingCell(code,spot,!spot||visibleIds.has(spot.id),column,areaGridRow,match.bounds.columnSpan,match.bounds.rowSpan));
        }else{
          cells.push(`<div class="parking-special type-${escapeHtml(match.area.type)}" style="grid-column:${column+1}/span ${match.bounds.columnSpan};grid-row:${areaGridRow}/span ${match.bounds.rowSpan}" role="gridcell"><strong>${escapeHtml(match.area.label)}</strong>${match.area.label?`<small>${escapeHtml(match.area.type)}</small>`:''}</div>`);
        }
        continue;
      }
      const spot=byPosition.get(code),parking=layout.defaultCellType==='parking'||positionInRanges(code,layout.parkingRanges);
      cells.push(parking?parkingCell(code,spot,!spot||visibleIds.has(spot.id),column,gridRow):blockedCell(code,column,gridRow));
    }
  }
  return`<section class="parking-map" aria-label="${escapeHtml(layout.name)} 주차장 배치"><div class="parking-map-head"><div><span>9 × ${layout.rows} GRID</span><h2>${escapeHtml(layout.name)}</h2></div><div class="parking-map-actions"><p>차량번호 뒤 4자리 표시</p></div></div><div class="parking-map-scroll"><div class="parking-map-grid" role="grid" style="--map-columns:${layout.columns};--map-rows:${visibleRows.length+(hasToggle?1:0)}">${cells.join('')}</div></div></section>`;
}
