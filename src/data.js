const zones = [
  { id: 'pillar11', name: '11번 기둥', short: '11번', count: 30 },
  { id: 'b3', name: '지하 3층', short: 'B3', count: 10 },
  { id: 'b5', name: '지하 5층', short: 'B5', count: 12 },
  { id: 'roof', name: '옥상', short: '옥상', count: 20 },
  { id: 'tower', name: '새싹타워', short: '타워', count: 20 },
  { id: 'auto13', name: '오토플렉스 13층', short: '13F', count: 12 }
];

const models = ['쏘나타', '그랜저', '아반떼', '카니발', '스포티지', '투싼', 'K5', '셀토스'];
const colors = ['흰색', '검정', '은색', '회색', '파랑'];
const plateSeeds = ['186저9439', '332거4844', '104누5036', '56거2704', '289무7006', '169무1539', '167조3574', '383다3500', '257저9955', '25나5633', '51보1818', '242부9198', '170누6876', '56마7937', '50고3422', '210부1269'];

export const STATUS = [
  { id: 'battery', label: '배터리', mark: 'B' },
  { id: 'fuel', label: '주유', mark: 'F' },
  { id: 'key', label: '키 방전', mark: 'K' },
  { id: 'engine', label: '엔진 경고', mark: 'E' },
  { id: 'tire', label: '공기압', mark: 'T' },
  { id: 'urea', label: '요소수', mark: 'U' }
];

export function makeInitialSpots() {
  let cursor = 0;
  return zones.flatMap((zone, zoneIndex) => Array.from({ length: zone.count }, (_, index) => {
    const occupied = (cursor++ * 7 + zoneIndex * 3) % 10 < 7;
    const row = String.fromCharCode(65 + (index % (zone.id === 'pillar11' ? 6 : zone.id === 'tower' ? 5 : 4)));
    const number = Math.floor(index / (zone.id === 'pillar11' ? 6 : zone.id === 'tower' ? 5 : 4)) + 1;
    const plate = occupied ? (plateSeeds[(index + zoneIndex * 3) % plateSeeds.length] || '') : '';
    const alerts = occupied && index % 7 === 1 ? [STATUS[(index + zoneIndex) % STATUS.length].id] : [];
    return {
      id: `${zone.id}-${index + 1}`,
      zoneId: zone.id,
      zone: zone.name,
      zoneShort: zone.short,
      label: `${row}${number}`,
      plate,
      model: occupied ? models[(index + zoneIndex) % models.length] : '',
      color: occupied ? colors[(index * 2 + zoneIndex) % colors.length] : '',
      alerts,
      updatedAt: '오늘 14:20'
    };
  }));
}

export { zones };
