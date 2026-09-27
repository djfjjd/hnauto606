-- 펼친 새싹타워 도면의 A01, M01, D03, J03을 비주차면으로 전환합니다.
-- 차량 또는 이동 이력이 연결된 기존 레코드는 보존합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND label IN ('A01','M01','D03','J03')
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
  );
