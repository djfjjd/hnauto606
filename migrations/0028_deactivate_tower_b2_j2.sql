-- 펼친 새싹타워 도면에서 B02~J02는 비주차 영역입니다.
-- 차량 및 이동 이력이 연결된 기존 주차면은 보존합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND substr(label,1,1) BETWEEN 'B' AND 'J'
  AND CAST(substr(label,2) AS INTEGER)=2
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
  );
