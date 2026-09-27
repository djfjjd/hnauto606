-- 새싹타워 B6층 11~20번의 실제 좌표를 이동 가능한 활성 주차면으로 보정합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label,active) VALUES
  ('tower-grid-A20','tower','A20',1),
  ('tower-grid-A19','tower','A19',1),
  ('tower-grid-A17','tower','A17',1),
  ('tower-grid-A16','tower','A16',1),
  ('tower-grid-B14','tower','B14',1),
  ('tower-grid-C14','tower','C14',1),
  ('tower-grid-D14','tower','D14',1),
  ('tower-grid-E14','tower','E14',1);

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND label IN ('A20','A19','A17','A16','B14','C14','D14','E14');
