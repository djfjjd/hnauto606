-- 새싹타워의 검정 X 표시 칸과 J14~M21 병합 영역을 비활성화합니다.
-- 차량 또는 이동 이력이 연결된 기존 레코드는 보존합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND (
    (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) BETWEEN 2 AND 13)
    OR (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 4 AND 6)
    OR (substr(label,1,1) BETWEEN 'B' AND 'D' AND CAST(substr(label,2) AS INTEGER)=1)
    OR label IN ('M08','A15','A18')
    OR (substr(label,1,1)='J' AND CAST(substr(label,2) AS INTEGER) BETWEEN 4 AND 8)
    OR (substr(label,1,1) BETWEEN 'H' AND 'M' AND CAST(substr(label,2) AS INTEGER)=14)
    OR (substr(label,1,1) BETWEEN 'J' AND 'M' AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 21)
  )
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
  );
