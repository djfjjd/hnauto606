-- 6층 A05~C05을 실제 배정 가능한 주차면으로 추가합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label,active) VALUES
  ('pillar11-grid-A05','pillar11','A05',1),
  ('pillar11-grid-B05','pillar11','B05',1),
  ('pillar11-grid-C05','pillar11','C05',1);

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11' AND label IN ('A05','B05','C05');
