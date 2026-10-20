-- 옥상 병합 주차면 A16과 C16을 실제 배정 가능한 자리로 추가합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label,active) VALUES
  ('roof-grid-A16','roof','A16',1),
  ('roof-grid-C16','roof','C16',1);

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='roof' AND label IN ('A16','C16','A17');
