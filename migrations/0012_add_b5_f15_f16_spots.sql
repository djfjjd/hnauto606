-- 지하 5층 F15, F16을 배정 가능한 주차면으로 추가합니다.
-- 기존 주차면과 차량 연결은 변경하지 않습니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
VALUES
  ('b5-grid-F15','b5','F15'),
  ('b5-grid-F16','b5','F16');

UPDATE parking_spots
SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='b5' AND label IN ('F15','F16');
