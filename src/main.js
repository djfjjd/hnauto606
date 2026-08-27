import './style.css';
import { makeInitialSpots, STATUS, zones } from './data.js';

const STORAGE_KEY = 'hana-parking-renewal-v1';
const saved = localStorage.getItem(STORAGE_KEY);
const state = {
  spots: saved ? JSON.parse(saved) : makeInitialSpots(),
  query: '',
  zone: 'all',
  filter: 'all',
  selected: null
};

const app = document.querySelector('#app');
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state.spots));

function stats() {
  const occupied = state.spots.filter(s => s.plate).length;
  return { total: state.spots.length, occupied, empty: state.spots.length - occupied, alerts: state.spots.filter(s => s.alerts.length).length };
}

function filteredSpots() {
  const q = state.query.trim().toLowerCase();
  return state.spots.filter(s => {
    const zoneOk = state.zone === 'all' || s.zoneId === state.zone;
    const filterOk = state.filter === 'all' || (state.filter === 'occupied' && s.plate) || (state.filter === 'empty' && !s.plate) || (state.filter === 'alert' && s.alerts.length);
    const queryOk = !q || [s.plate, s.model, s.color, s.label, s.zone].some(v => v.toLowerCase().includes(q));
    return zoneOk && filterOk && queryOk;
  });
}

function render() {
  const { total, occupied, empty, alerts } = stats();
  const visible = filteredSpots();
  app.innerHTML = `
    <header class="topbar">
      <a class="brand" href="#top" aria-label="하나 파킹 홈"><span class="brand-mark">H</span><span>HANA <b>PARKING</b></span></a>
      <nav><a href="#dashboard" class="active">현황판</a><a href="#zones">구역 관리</a><button class="print-link" data-print>인쇄</button></nav>
      <button class="profile" aria-label="관리자 메뉴">관리자 <span>●</span></button>
    </header>
    <main id="top">
      <section class="hero" id="dashboard">
        <div>
          <p class="eyebrow">LIVE PARKING BOARD</p>
          <h1>차량의 위치를<br><em>한눈에, 정확하게.</em></h1>
          <p class="lede">주차 현황부터 차량 상태까지, 필요한 정보를 빠르게 확인하세요.</p>
        </div>
        <div class="hero-stat"><span>현재 주차율</span><strong>${Math.round(occupied / total * 100)}<small>%</small></strong><div class="meter"><i style="width:${occupied / total * 100}%"></i></div><p>${occupied}대 주차 · ${empty}자리 여유</p></div>
      </section>

      <section class="summary" aria-label="주차 요약">
        ${metric('전체 주차면', total, 'TOTAL', 'neutral')}
        ${metric('주차 중', occupied, 'IN USE', 'dark')}
        ${metric('빈 자리', empty, 'AVAILABLE', 'green')}
        ${metric('확인 필요', alerts, 'CHECK', 'amber')}
      </section>

      <section class="workspace" id="zones">
        <div class="section-head"><div><p class="eyebrow">PARKING MAP</p><h2>주차 현황</h2></div><p class="updated">● 실시간 반영 <span>방금 전 업데이트</span></p></div>
        <div class="toolbar">
          <label class="search"><span>⌕</span><input id="search" value="${escapeHtml(state.query)}" placeholder="차량번호, 차종, 색상 검색" aria-label="차량 검색"></label>
          <div class="segmented" aria-label="상태 필터">${filterButton('all','전체')}${filterButton('occupied','주차 중')}${filterButton('empty','빈 자리')}${filterButton('alert','확인 필요')}</div>
        </div>
        <div class="zone-tabs" role="tablist"><button data-zone="all" class="${state.zone === 'all' ? 'active' : ''}">전체 구역</button>${zones.map(z => `<button data-zone="${z.id}" class="${state.zone === z.id ? 'active' : ''}">${z.short}</button>`).join('')}</div>
        <div class="legend"><span><i class="dot occupied"></i>주차 중</span><span><i class="dot empty"></i>빈 자리</span><span><i class="dot alert"></i>확인 필요</span></div>
        <div class="zones">${zones.map(zone => zoneCard(zone, visible.filter(s => s.zoneId === zone.id))).join('')}</div>
        ${visible.length ? '' : '<div class="no-result"><strong>검색 결과가 없습니다.</strong><p>다른 차량번호나 필터를 확인해 주세요.</p></div>'}
      </section>
    </main>
    <footer><span>HANA PARKING</span><p>현장의 흐름을 더 단순하게.</p><small>데이터는 이 기기의 브라우저에 저장됩니다.</small></footer>
    ${state.selected ? modal(state.spots.find(s => s.id === state.selected)) : ''}
  `;
  bind();
}

function metric(label, value, english, tone) { return `<article class="metric ${tone}"><span>${english}</span><div><strong>${value}</strong><small>${label}</small></div></article>`; }
function filterButton(id, label) { return `<button data-filter="${id}" class="${state.filter === id ? 'active' : ''}">${label}</button>`; }
function zoneCard(zone, spots) {
  if (!spots.length) return '';
  const all = state.spots.filter(s => s.zoneId === zone.id);
  const used = all.filter(s => s.plate).length;
  return `<article class="zone-card"><div class="zone-title"><div><span>${zone.short}</span><h3>${zone.name}</h3></div><p><b>${used}</b> / ${all.length}대</p></div><div class="spot-grid">${spots.map(spotButton).join('')}</div></article>`;
}
function spotButton(s) {
  const alert = s.alerts.length ? ' has-alert' : '';
  return `<button class="spot ${s.plate ? 'is-used' : 'is-empty'}${alert}" data-spot="${s.id}" aria-label="${s.zone} ${s.label} ${s.plate || '빈 자리'}"><span class="spot-label">${s.label}</span>${s.alerts.length ? `<span class="alert-mark">${s.alerts.length}</span>` : ''}<strong>${s.plate || '빈 자리'}</strong><small>${s.plate ? `${s.model} · ${s.color}` : '입차 가능'}</small></button>`;
}

function modal(s) {
  return `<div class="modal-backdrop" data-close><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-modal><button class="modal-close" data-close aria-label="닫기">×</button><p class="eyebrow">${s.zone} · ${s.label}</p><h2 id="modal-title">${s.plate ? '차량 정보' : '신규 입차'}</h2><form id="vehicle-form"><label>차량번호<input name="plate" value="${escapeHtml(s.plate)}" placeholder="123가 4567" required></label><div class="form-row"><label>차종<input name="model" value="${escapeHtml(s.model)}" placeholder="예: 쏘나타"></label><label>색상<input name="color" value="${escapeHtml(s.color)}" placeholder="예: 흰색"></label></div><fieldset><legend>확인 필요 상태</legend><div class="status-list">${STATUS.map(item => `<label><input type="checkbox" name="alerts" value="${item.id}" ${s.alerts.includes(item.id) ? 'checked' : ''}><span>${item.mark}</span>${item.label}</label>`).join('')}</div></fieldset><div class="modal-actions">${s.plate ? '<button type="button" class="ghost danger" data-exit>출차 처리</button>' : '<span></span>'}<button type="submit" class="primary">${s.plate ? '변경사항 저장' : '입차 등록'}</button></div></form></section></div>`;
}

function bind() {
  document.querySelector('#search')?.addEventListener('input', e => { state.query = e.target.value; render(); document.querySelector('#search')?.focus(); });
  document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => { state.filter = el.dataset.filter; render(); }));
  document.querySelectorAll('[data-zone]').forEach(el => el.addEventListener('click', () => { state.zone = el.dataset.zone; render(); }));
  document.querySelectorAll('[data-spot]').forEach(el => el.addEventListener('click', () => { state.selected = el.dataset.spot; render(); }));
  document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', e => { if (e.target.closest('[data-modal]') && !e.target.matches('.modal-close')) return; state.selected = null; render(); }));
  document.querySelector('[data-print]')?.addEventListener('click', () => window.print());
  document.querySelector('#vehicle-form')?.addEventListener('submit', e => {
    e.preventDefault(); const form = new FormData(e.currentTarget); const spot = state.spots.find(s => s.id === state.selected);
    spot.plate = String(form.get('plate')).trim(); spot.model = String(form.get('model')).trim(); spot.color = String(form.get('color')).trim(); spot.alerts = form.getAll('alerts'); spot.updatedAt = '방금 전'; save(); state.selected = null; render();
  });
  document.querySelector('[data-exit]')?.addEventListener('click', () => { const spot = state.spots.find(s => s.id === state.selected); Object.assign(spot,{plate:'',model:'',color:'',alerts:[],updatedAt:'방금 전'}); save(); state.selected = null; render(); });
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
render();
