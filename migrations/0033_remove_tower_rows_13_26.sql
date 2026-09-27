-- 새싹타워 펼친 도면에서 13행과 26행을 제거합니다.
-- 차량 또는 이동 이력이 연결된 기존 레코드는 보존합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND CAST(substr(label,2) AS INTEGER) IN (13,26)
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
  );
