import {PARKING_COLUMNS,normalizePosition,positionInRanges,positionParts,towerParkingLabel} from './parking-layouts.js';
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

function parkingCell(code,spot,visible,column,gridRow,columnSpan=1,rowSpan=1,tinted=false,displayLabel=''){
  const position=`grid-column:${column+1}/span ${columnSpan};grid-row:${gridRow}/span ${rowSpan}`;
  const spaceNumber=displayLabel?`<small class="parking-space-number">${escapeHtml(displayLabel)}</small>`:'';
  if(!spot)return`<div class="parking-cell is-vacant is-virtual${tinted?' is-company-tint':''}" style="${position}" role="gridcell" aria-label="${code} 빈 자리">${spaceNumber}</div>`;
  const occupied=Boolean(spot.plate),checkedOut=occupied&&spot.isCheckedOut,contracted=occupied&&spot.isContracted,rental=occupied&&/[하허호]/.test(String(spot.plate)),hasMemo=occupied&&Boolean(String(spot.memo||'').trim())&&String(spot.memo).trim().toUpperCase()!=='X',alerts=occupied?(spot.alerts||[]).map(id=>STATUS.find(status=>status.id===id)).filter(Boolean):[],classes=['parking-cell',occupied?'is-occupied':'is-vacant',occupied?`vehicle-color-${vehicleColorClass(spot.color)}`:'',rental?'is-rental':'',checkedOut?'is-checked-out':contracted?'is-contracted':'',hasMemo?'has-memo':'',visible?'':'is-filtered'].filter(Boolean).join(' '),alertIcons=alerts.length?`<span class="parking-alert-icons" aria-label="${escapeHtml(alerts.map(status=>status.label).join(', '))}">${alerts.map(status=>`<img src="/${escapeHtml(status.icon.normalize('NFD'))}" alt="${escapeHtml(status.label)}">`).join('')}</span>`:'',optionIndicator=hasMemo?`<i class="parking-option-indicator" aria-label="특이사항 있음" title="${escapeHtml(spot.memo)}">!</i>`:'';
  const stateLabel=contracted?'계약됨':checkedOut?'출고됨':'주차 중';
  return`<button class="${classes}${tinted&&!occupied?' is-company-tint':''}" data-spot="${escapeHtml(spot.id)}" ${occupied?'draggable="true"':''} style="${position}" role="gridcell" aria-label="${code} ${occupied?`${spot.plate} ${stateLabel}`:'빈 자리'}">${spaceNumber}${occupied?`<strong>${escapeHtml(lastFour(spot.plate))}</strong><span>${contracted?'(계약됨) ':checkedOut?'(출고됨) ':''}${escapeHtml(spot.model||'차량')}</span>${alertIcons}${optionIndicator}`:''}</button>`;
}

function blockedCell(code,column,gridRow){
  return`<div class="parking-cell is-layout-blocked" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비주차 구역"></div>`;
}

function unavailableCell(code,column,gridRow){
  return`<div class="parking-cell is-vacant is-unavailable" style="grid-column:${column+1};grid-row:${gridRow}" role="gridcell" aria-label="${code} 비활성 구역"><strong class="parking-unavailable-mark" aria-hidden="true">X</strong></div>`;
}

function makeCollapsedGroupRows(layout,byPosition){
  const groups=Object.entries(layout.collapsedGroups).map(([label,positions])=>({label,items:positions.map((position,index)=>({position,index,spot:byPosition.get(normalizePosition(position))})).sort((a,b)=>Number(!a.spot?.plate)-Number(!b.spot?.plate)||a.index-b.index)}));
  let emptyToHide=Math.max(0,groups.reduce((sum,group)=>sum+group.items.length,0)-(layout.collapsedVisibleLimit||Infinity));
  for(let groupIndex=groups.length-1;groupIndex>=0&&emptyToHide>0;groupIndex-=1){const items=groups[groupIndex].items;for(let index=items.length-1;index>=0&&emptyToHide>0;index-=1){if(items[index].spot?.plate)continue;items.splice(index,1);emptyToHide-=1;}}
  return groups.flatMap(({label,items})=>{const groupColumns=layout.collapsedGroupColumns?.[label]||layout.collapsedColumns||8;return Array.from({length:Math.ceil(items.length/groupColumns)},(_,index)=>({label:`${label}층`,items:items.slice(index*groupColumns,index*groupColumns+groupColumns)}));});
}

export function renderParkingMap(layout,spots,visibleIds=new Set(spots.map(spot=>spot.id)),options={}){
  const byPosition=new Map(spots.map(spot=>[normalizePosition(spot.label),spot]));
  const hiddenRows=new Set(layout.hiddenRows||[]),allRows=Array.from({length:layout.rows},(_,index)=>index+1).filter(row=>!hiddenRows.has(row)),hasToggle=Boolean(layout.collapseBeforeRow||layout.collapsedVisibleRows),collapsed=hasToggle&&!options.expanded,parkingRanges=collapsed&&layout.collapsedParkingRanges?layout.collapsedParkingRanges:layout.parkingRanges,collapsedGroupRows=collapsed&&layout.collapsedGroups?makeCollapsedGroupRows(layout,byPosition):null,showCoordinates=!collapsed,columnHeadersHidden=Boolean(layout.hideColumnHeaders||(collapsed&&layout.collapsedHideColumnHeaders)),showColumnHeaders=showCoordinates&&!columnHeadersHidden,hasRowLabelColumn=!layout.hideRowLabels,showRowLabels=hasRowLabelColumn&&(showCoordinates||Boolean(layout.rowLabels)||Boolean(collapsedGroupRows)),headerRows=columnHeadersHidden?0:1,collapsedRows=layout.collapsedVisibleRows||allRows.filter(row=>row>=layout.collapseBeforeRow),visibleRows=collapsedGroupRows?collapsedGroupRows.map((_,index)=>index+1):collapsed?collapsedRows:allRows,startColumn=layout.startColumn||1,baseColumns=collapsed&&layout.collapsedColumns?layout.collapsedColumns:options.expanded&&layout.expandedColumns?layout.expandedColumns:layout.columns,splitAfterRow=!collapsed&&Number(options.splitAfterRow)||0,sideBySide=splitAfterRow>0,secondSideColumns=sideBySide?Math.min(baseColumns,Number(options.splitSecondColumns)||baseColumns):baseColumns,endColumn=startColumn+baseColumns-1,secondEndColumn=startColumn+secondSideColumns-1,columns=sideBySide?baseColumns+secondSideColumns:baseColumns,firstSideRows=sideBySide?visibleRows.filter(row=>row<=splitAfterRow).length:visibleRows.length,mapRows=sideBySide?Math.max(firstSideRows,visibleRows.length-firstSideRows):visibleRows.length,gridColumn=(column,row=0)=>column-startColumn+(hasRowLabelColumn?1:0)+(sideBySide&&row>splitAfterRow?baseColumns:0),gridRowByActual=new Map(visibleRows.map((row,index)=>[row,(sideBySide&&row>splitAfterRow?index-firstSideRows:index)+1+headerRows])),cells=[];
  if(showColumnHeaders){const columnLabels=PARKING_COLUMNS.slice(startColumn-1,endColumn),secondColumnLabels=columnLabels.slice(0,secondSideColumns);cells.push(...(hasRowLabelColumn?['<span class="map-corner" style="grid-column:1;grid-row:1" aria-hidden="true"></span>']:[]),...columnLabels.map((column,index)=>`<b class="map-column" style="grid-column:${index+(hasRowLabelColumn?2:1)};grid-row:1" aria-hidden="true">${column}</b>`),...(sideBySide?secondColumnLabels.map((column,index)=>`<b class="map-column" style="grid-column:${baseColumns+index+(hasRowLabelColumn?2:1)};grid-row:1" aria-hidden="true">${column}</b>`):[]));}
  for(const row of visibleRows){
    const gridRow=gridRowByActual.get(row);
    const collapsedGroupRow=collapsedGroupRows?.[row-1];
    if(showRowLabels)cells.push(`<b class="map-row" style="grid-column:1;grid-row:${gridRow}" aria-hidden="true">${escapeHtml(collapsedGroupRow?.label||layout.rowLabels?.[row]||String(row).padStart(2,'0'))}</b>`);
    if(collapsedGroupRow){for(const [index,item] of collapsedGroupRow.items.entries()){const number=towerParkingLabel(item.position).split(' ').at(-1);cells.push(parkingCell(item.position,item.spot,!item.spot||visibleIds.has(item.spot.id),index+(hasRowLabelColumn?1:0),gridRow,1,1,false,number));}continue;}
    const rowEndColumn=sideBySide&&row>splitAfterRow?secondEndColumn:endColumn;
    for(let column=startColumn;column<=rowEndColumn;column+=1){
      const code=`${PARKING_COLUMNS[column-1]}${String(row).padStart(2,'0')}`,match=areaAt(layout,column,row);
      if(match){
        const visibleAreaStart=Math.max(match.bounds.column,startColumn),visibleAreaEnd=Math.min(match.bounds.column+match.bounds.columnSpan-1,rowEndColumn);
        if(column!==visibleAreaStart||row!==match.bounds.row)continue;
        const areaGridRow=gridRowByActual.get(match.bounds.row);
        if(!areaGridRow)continue;
        if(match.area.type==='parking'){
          const spot=byPosition.get(normalizePosition(match.area.from));
          cells.push(parkingCell(code,spot,!spot||visibleIds.has(spot.id),gridColumn(column,row),areaGridRow,visibleAreaEnd-visibleAreaStart+1,match.bounds.rowSpan));
        }else{
          const areaLabel=match.area.type==='facility'&&sideBySide?(row>splitAfterRow?options.secondSideFacilityLabel:options.firstSideFacilityLabel)||match.area.label:match.area.label;
          cells.push(`<div class="parking-special type-${escapeHtml(match.area.type)}${match.area.borderless?' is-borderless':''}" style="grid-column:${gridColumn(column,row)+1}/span ${visibleAreaEnd-visibleAreaStart+1};grid-row:${areaGridRow}/span ${match.bounds.rowSpan}" role="gridcell"><strong>${escapeHtml(areaLabel)}</strong></div>`);
        }
        continue;
      }
      const spot=byPosition.get(code),unavailable=!collapsed&&positionInRanges(code,layout.unavailableRanges),parking=layout.defaultCellType==='parking'||positionInRanges(code,parkingRanges);
      cells.push(unavailable?unavailableCell(code,gridColumn(column,row),gridRow):parking?parkingCell(code,spot,!spot||visibleIds.has(spot.id),gridColumn(column,row),gridRow,1,1,positionInRanges(code,layout.tintedRanges)):blockedCell(code,gridColumn(column,row),gridRow));
    }
  }
  if(options.zoneId==='pillar11'&&gridRowByActual.has(18))cells.push(`<div class="parking-pillar-divider" style="grid-column:6/span 5;grid-row:${gridRowByActual.get(18)}" aria-label="17행과 18행 사이 11번기둥"><span>11번기둥</span></div>`);
  if(options.zoneId==='b3'&&gridRowByActual.has(17))cells.push(`<div class="parking-pillar-divider" style="grid-column:4/span 5;grid-row:${gridRowByActual.get(17)}" aria-label="16행과 17행 사이 19번기둥"><span>19번기둥</span></div>`);
  if(options.zoneId==='b5'&&gridRowByActual.has(14))cells.push(`<div class="parking-pillar-divider is-label-right" style="grid-column:2/span 6;grid-row:${gridRowByActual.get(14)}" aria-label="13행 A~F와 14행 A~F 사이 9번기둥"><span>9번기둥</span></div>`);
  if(options.zoneId==='b5'&&(gridRowByActual.has(18)||gridRowByActual.has(17))){const afterVisibleRow=!gridRowByActual.has(18);cells.push(`<div class="parking-pillar-divider is-label-right${afterVisibleRow?' is-after-row':''}" style="grid-column:2/span 6;grid-row:${gridRowByActual.get(afterVisibleRow?17:18)}" aria-label="17행 A~F와 18행 A~F 사이 8번기둥"><span>8번기둥</span></div>`);}
  for(const section of layout.sectionBorders||[]){const bounds=areaBounds(section),gridRow=bounds&&gridRowByActual.get(bounds.row),sectionEndColumn=sideBySide&&bounds?.row>splitAfterRow?secondEndColumn:endColumn,sectionColumnSpan=bounds?Math.min(bounds.columnSpan,sectionEndColumn-bounds.column+1):0;if(!bounds||!gridRow||sectionColumnSpan<1||!gridRowByActual.has(bounds.row+bounds.rowSpan-1))continue;cells.push(`<div class="parking-section-border" style="grid-column:${gridColumn(bounds.column,bounds.row)+1}/span ${sectionColumnSpan};grid-row:${gridRow}/span ${bounds.rowSpan}" aria-hidden="true"></div>`);}
  return`<section class="parking-map" data-map-zone="${escapeHtml(options.zoneId||'')}" aria-label="${escapeHtml(layout.name)} 주차장 배치"><div class="parking-map-head"><h2>${escapeHtml(layout.name)}</h2>${hasToggle?`<button class="map-head-toggle" data-toggle-map="${escapeHtml(options.zoneId||'')}" aria-expanded="${options.expanded?'true':'false'}"><span aria-hidden="true">${options.expanded?'▲':'▼'}</span> ${options.expanded?'접기':'펼치기'}</button>`:''}</div><div class="parking-map-scroll"><div class="parking-map-grid${headerRows?'':' has-no-column-header'}${hasRowLabelColumn?'':' has-no-row-label'}${sideBySide?' is-side-by-side':''}" role="grid" style="--map-columns:${columns};--map-rows:${mapRows};--map-header-rows:${headerRows};--cell-width:${layout.cellWidth||62}px;--row-label-width:${layout.rowLabelWidth||20}px">${cells.join('')}</div></div></section>`;
}
