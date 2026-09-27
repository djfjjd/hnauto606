import {PARKING_COLUMNS,normalizePosition,positionInRanges,positionParts} from './parking-layouts.js';
import {STATUS} from './data.js';

const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const lastFour=plate=>String(plate||'').slice(-4);
const vehicleColorClass=value=>({검정:'black',흰색:'white',쥐색:'gray',회색:'gray',은색:'gray',녹색:'green',빨강:'red',파랑:'blue',블루:'blue',베이지:'beige',노랑:'yellow'}[String(value||'').trim()]||'black');

function areaBounds(area){
  const from=positionParts(area.from),to=positionParts(area.to||area.from);
  return from&&to?{column:Math.min(from.column,to.column),row:Math.min(from.row,to.row),columnSpan:Math.abs(to.column-from.column)+1,rowSpan:Math.abs(to.row-from.row)+1}:null;
}

function areaAt(layout,column,row){
  return layout.specialAreas.map(area=>({area,bounds:areaBounds(area)})).find(({bounds})=>bounds&&column>=bounds.column&&column<bounds.column+bounds.columnSpan&&row>=bounds.row&&row<bounds.row+bounds.rowSpan);
}

function parkingCell(code,spot,visible,column,gridRow,columnSpan=1,rowSpan=1,tinted=false){
  const position=`grid-column:${column+1}/span ${columnSpan};grid-row:${gridRow}/span ${rowSpan}`;
  if(!spot)return`<div class="parking-cell is-vacant is-virtual${tinted?' is-company-tint':''}" style="${position}" role="gridcell" aria-label="${code} 빈 자리"></div>`;
  const occupied=Boolean(spot.plate),checkedOut=occupied&&spot.isCheckedOut,contracted=occupied&&spot.isContracted,rental=occupied&&/[하허호]/.test(String(spot.plate)),hasMemo=occupied&&Boolean(String(spot.memo||'').trim())&&String(spot.memo).trim().toUpperCase()!=='X',alerts=occupied?(spot.alerts||[]).map(id=>STATUS.find(status=>status.id===id)).filter(Boolean):[],classes=['parking-cell',occupied?'is-occupied':'is-vacant',occupied?`vehicle-color-${vehicleColorClass(spot.color)}`:'',rental?'is-rental':'',checkedOut?'is-checked-out':contracted?'is-contracted':'',hasMemo?'has-memo':'',visible?'':'is-filtered'].filter(Boolean).join(' '),alertIcons=alerts.length?`<span class="parking-alert-icons" aria-label="${escapeHtml(alerts.map(status=>status.label).join(', '))}">${alerts.map(status=>`<img src="/${escapeHtml(status.icon.normalize('NFD'))}" alt="${escapeHtml(status.label)}">`).join('')}</span>`:'',optionIndicator=hasMemo?`<i class="parking-option-indicator" aria-label="특이사항 있음" title="${escapeHtml(spot.memo)}">!</i>`:'';
  const stateLabel=contracted?'계약됨':checkedOut?'출고됨':'주차 중';
  return`<button class="${classes}${tinted&&!occupied?' is-company-tint':''}" data-spot="${escapeHtml(spot.id)}" ${occupied?'draggable="true"':''} style="${position}" role="gridcell" aria-label="${code} ${occupied?`${spot.plate} ${stateLabel}`:'빈 자리'}">${occupied?`<strong>${escapeHtml(lastFour(spot.plate))}</strong><span>${contracted?'(계약됨) ':checkedOut?'(출고됨) ':''}${escapeHtml(spot.model||'차량')}</span>${alertIcons}${optionIndicator}`:''}</button>`;
}

function blockedCell(code,column,gridRow){
  return`<div class="parking-cell is-layout-blocked" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비주차 구역"></div>`;
}

function unavailableCell(code,column,gridRow){
  return`<div class="parking-cell is-vacant is-unavailable" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비활성 구역"></div>`;
}

export function renderParkingMap(layout,spots,visibleIds=new Set(spots.map(spot=>spot.id)),options={}){
  const byPosition=new Map(spots.map(spot=>[normalizePosition(spot.label),spot]));
  const allRows=Array.from({length:layout.rows},(_,index)=>index+1),hasToggle=Boolean(layout.collapseBeforeRow||layout.collapsedVisibleRows),collapsed=hasToggle&&!options.expanded,parkingRanges=collapsed&&layout.collapsedParkingRanges?layout.collapsedParkingRanges:layout.parkingRanges,showCoordinates=!collapsed,columnHeadersHidden=Boolean(layout.hideColumnHeaders||(collapsed&&layout.collapsedHideColumnHeaders)),showColumnHeaders=showCoordinates&&!columnHeadersHidden,showRowLabels=showCoordinates||Boolean(layout.rowLabels)||Boolean(collapsed&&layout.collapsedRowLabels),headerRows=columnHeadersHidden?0:1,collapsedRows=layout.collapsedVisibleRows||allRows.filter(row=>row>=layout.collapseBeforeRow),visibleRows=collapsed?collapsedRows:allRows,startColumn=layout.startColumn||1,columns=options.expanded&&layout.expandedColumns?layout.expandedColumns:layout.columns,endColumn=startColumn+columns-1,gridColumn=column=>column-startColumn+1,gridRowByActual=new Map(visibleRows.map((row,index)=>[row,index+1+headerRows])),cells=[];
  if(showColumnHeaders)cells.push('<span class="map-corner" style="grid-column:1;grid-row:1" aria-hidden="true"></span>',...PARKING_COLUMNS.slice(startColumn-1,endColumn).map((column,index)=>`<b class="map-column" style="grid-column:${index+2};grid-row:1" aria-hidden="true">${column}</b>`));
  for(const row of visibleRows){
    const gridRow=gridRowByActual.get(row);
    if(showRowLabels)cells.push(`<b class="map-row" style="grid-column:1;grid-row:${gridRow}" aria-hidden="true">${escapeHtml((collapsed?layout.collapsedRowLabels?.[row]:null)||layout.rowLabels?.[row]||String(row).padStart(2,'0'))}</b>`);
    for(let column=startColumn;column<=endColumn;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`,match=areaAt(layout,column,row);
      if(match){
        const visibleAreaStart=Math.max(match.bounds.column,startColumn),visibleAreaEnd=Math.min(match.bounds.column+match.bounds.columnSpan-1,endColumn);
        if(column!==visibleAreaStart||row!==match.bounds.row)continue;
        const areaGridRow=gridRowByActual.get(match.bounds.row);
        if(!areaGridRow)continue;
        if(match.area.type==='parking'){
          const spot=byPosition.get(normalizePosition(match.area.from));
          cells.push(parkingCell(code,spot,!spot||visibleIds.has(spot.id),gridColumn(column),areaGridRow,visibleAreaEnd-visibleAreaStart+1,match.bounds.rowSpan));
        }else{
          cells.push(`<div class="parking-special type-${escapeHtml(match.area.type)}${match.area.borderless?' is-borderless':''}" style="grid-column:${gridColumn(column)+1}/span ${visibleAreaEnd-visibleAreaStart+1};grid-row:${areaGridRow}/span ${match.bounds.rowSpan}" role="gridcell"><strong>${escapeHtml(match.area.label)}</strong></div>`);
        }
        continue;
      }
      const spot=byPosition.get(code),unavailable=!collapsed&&positionInRanges(code,layout.unavailableRanges),parking=layout.defaultCellType==='parking'||positionInRanges(code,parkingRanges);
      cells.push(unavailable?unavailableCell(code,gridColumn(column),gridRow):parking?parkingCell(code,spot,!spot||visibleIds.has(spot.id),gridColumn(column),gridRow,1,1,positionInRanges(code,layout.tintedRanges)):blockedCell(code,gridColumn(column),gridRow));
    }
  }
  if(options.zoneId==='pillar11'&&gridRowByActual.has(18))cells.push(`<div class="parking-pillar-divider" style="grid-column:6/span 5;grid-row:${gridRowByActual.get(18)}" aria-label="17행과 18행 사이 11번기둥"><span>11번기둥</span></div>`);
  if(options.zoneId==='b3'&&gridRowByActual.has(17))cells.push(`<div class="parking-pillar-divider" style="grid-column:4/span 5;grid-row:${gridRowByActual.get(17)}" aria-label="16행과 17행 사이 19번기둥"><span>19번기둥</span></div>`);
  if(options.zoneId==='b5'&&gridRowByActual.has(14))cells.push(`<div class="parking-pillar-divider is-label-right" style="grid-column:2/span 6;grid-row:${gridRowByActual.get(14)}" aria-label="13행 A~F와 14행 A~F 사이 9번기둥"><span>9번기둥</span></div>`);
  if(options.zoneId==='b5'&&(gridRowByActual.has(18)||gridRowByActual.has(17))){const afterVisibleRow=!gridRowByActual.has(18);cells.push(`<div class="parking-pillar-divider is-label-right${afterVisibleRow?' is-after-row':''}" style="grid-column:2/span 6;grid-row:${gridRowByActual.get(afterVisibleRow?17:18)}" aria-label="17행 A~F와 18행 A~F 사이 8번기둥"><span>8번기둥</span></div>`);}
  for(const section of layout.sectionBorders||[]){const bounds=areaBounds(section),gridRow=bounds&&gridRowByActual.get(bounds.row);if(!bounds||!gridRow||!gridRowByActual.has(bounds.row+bounds.rowSpan-1))continue;cells.push(`<div class="parking-section-border" style="grid-column:${gridColumn(bounds.column)+1}/span ${bounds.columnSpan};grid-row:${gridRow}/span ${bounds.rowSpan}" aria-hidden="true"></div>`);}
  return`<section class="parking-map" data-map-zone="${escapeHtml(options.zoneId||'')}" aria-label="${escapeHtml(layout.name)} 주차장 배치"><div class="parking-map-head"><h2>${escapeHtml(layout.name)}</h2>${hasToggle?`<button class="map-head-toggle" data-toggle-map="${escapeHtml(options.zoneId||'')}" aria-expanded="${options.expanded?'true':'false'}"><span aria-hidden="true">${options.expanded?'▲':'▼'}</span> ${options.expanded?'접기':'펼치기'}</button>`:''}</div><div class="parking-map-scroll"><div class="parking-map-grid${headerRows?'':' has-no-column-header'}" role="grid" style="--map-columns:${columns};--map-rows:${visibleRows.length};--map-header-rows:${headerRows};--cell-width:${layout.cellWidth||62}px;--row-label-width:${layout.rowLabelWidth||20}px">${cells.join('')}</div></div></section>`;
}
