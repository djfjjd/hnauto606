-- 새싹타워를 B5층(A01~J01), B6층(A02~J02) 20면으로 구성합니다.
-- 기존 차량 연결 및 이동 이력이 있는 주차면은 삭제하지 않습니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
VALUES
  ('tower-grid-J01','tower','J01'),
  ('tower-grid-J02','tower','J02');

UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
      AND vehicles.checked_out_at IS NULL
  );

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND substr(label,1,1) BETWEEN 'A' AND 'J'
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 2;
