-- 새싹타워 3~8행의 활성 주차면을 E·K열에서 D·J열로 이동합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 3 UNION ALL SELECT value+1 FROM rows WHERE value<8),
  cols(letter) AS (VALUES('D'),('J'))
SELECT 'tower-grid-'||letter||printf('%02d',value),'tower',letter||printf('%02d',value)
FROM rows CROSS JOIN cols;

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND substr(label,1,1) IN ('D','J')
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 3 AND 8;

UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND substr(label,1,1) IN ('E','K')
  AND CAST(substr(label,2) AS INTEGER) BETWEEN 3 AND 8
  AND current_vehicle_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM vehicles
    WHERE vehicles.current_spot_id=parking_spots.id
  );
