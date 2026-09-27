-- B5 27~34번과 B6 05~10번을 실제 클릭·드래그 가능한 활성 주차면으로 보정합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label,active)
VALUES
  ('tower-grid-K01','tower','K01',1),
  ('tower-grid-L01','tower','L01',1),
  ('tower-grid-M02','tower','M02',1),
  ('tower-grid-M03','tower','M03',1),
  ('tower-grid-M04','tower','M04',1),
  ('tower-grid-M05','tower','M05',1),
  ('tower-grid-M06','tower','M06',1),
  ('tower-grid-M07','tower','M07',1),
  ('tower-grid-D21','tower','D21',1),
  ('tower-grid-A25','tower','A25',1),
  ('tower-grid-A24','tower','A24',1),
  ('tower-grid-A23','tower','A23',1),
  ('tower-grid-A22','tower','A22',1),
  ('tower-grid-A21','tower','A21',1);

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND label IN ('K01','L01','M02','M03','M04','M05','M06','M07','D21','A25','A24','A23','A22','A21');
