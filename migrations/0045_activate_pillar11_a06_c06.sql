-- 6층 A06~C06을 실제 배정 가능한 주차면으로 추가합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label,active) VALUES
  ('pillar11-grid-A06','pillar11','A06',1),
  ('pillar11-grid-B06','pillar11','B06',1),
  ('pillar11-grid-C06','pillar11','C06',1);

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label IN ('A06','B06','C06');
