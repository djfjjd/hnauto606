-- 기존 새싹타워 차량 18대를 B5층 21번부터 빈 X 구역을 건너뛰어 순서대로 재배치합니다.
CREATE TABLE _tower_vehicle_resequence_0036 (
  ordinal INTEGER PRIMARY KEY,
  vehicle_id TEXT NOT NULL UNIQUE
);

INSERT INTO _tower_vehicle_resequence_0036(ordinal,vehicle_id)
SELECT ROW_NUMBER() OVER (ORDER BY
  CASE
    WHEN substr(s.label,1,1)='D' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 4 AND 8 THEN CAST(substr(s.label,2) AS INTEGER)-3
    WHEN substr(s.label,1,1)='A' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 2 AND 12 THEN 19-CAST(substr(s.label,2) AS INTEGER)
    WHEN substr(s.label,1,1) BETWEEN 'B' AND 'L' AND CAST(substr(s.label,2) AS INTEGER)=1 THEN unicode(substr(s.label,1,1))-48
    WHEN substr(s.label,1,1)='M' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 2 AND 8 THEN CAST(substr(s.label,2) AS INTEGER)+27
    WHEN substr(s.label,1,1)='J' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 4 AND 8 THEN 44-CAST(substr(s.label,2) AS INTEGER)
    WHEN substr(s.label,1,1)='D' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 17 AND 21 THEN 100+CAST(substr(s.label,2) AS INTEGER)-16
    WHEN substr(s.label,1,1)='A' AND CAST(substr(s.label,2) AS INTEGER) BETWEEN 15 AND 25 THEN 100+31-CAST(substr(s.label,2) AS INTEGER)
    WHEN substr(s.label,1,1) BETWEEN 'B' AND 'G' AND CAST(substr(s.label,2) AS INTEGER)=14 THEN 100+unicode(substr(s.label,1,1))-49
    ELSE 999
  END,
  v.created_at,
  v.id
) AS ordinal,v.id
FROM vehicles v
JOIN parking_spots s ON s.id=v.current_spot_id
WHERE s.zone_id='tower'
ORDER BY ordinal
LIMIT 18;

CREATE TABLE _tower_targets_0036 (
  ordinal INTEGER PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

INSERT INTO _tower_targets_0036(ordinal,label) VALUES
  (1,'E01'),(2,'F01'),(3,'I01'),(4,'J01'),(5,'K01'),(6,'L01'),
  (7,'M02'),(8,'M03'),(9,'M04'),(10,'M05'),(11,'M06'),(12,'M07'),
  (13,'D17'),(14,'D18'),(15,'D19'),(16,'D20'),(17,'D21'),(18,'A25');

UPDATE parking_spots
SET current_vehicle_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE current_vehicle_id IN (SELECT vehicle_id FROM _tower_vehicle_resequence_0036);

UPDATE vehicles
SET current_spot_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_vehicle_resequence_0036);

UPDATE parking_spots
SET current_vehicle_id=(
  SELECT r.vehicle_id
  FROM _tower_targets_0036 t
  JOIN _tower_vehicle_resequence_0036 r ON r.ordinal=t.ordinal
  WHERE t.label=parking_spots.label
),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND label IN (SELECT label FROM _tower_targets_0036)
  AND EXISTS (
    SELECT 1
    FROM _tower_targets_0036 t
    JOIN _tower_vehicle_resequence_0036 r ON r.ordinal=t.ordinal
    WHERE t.label=parking_spots.label
  );

UPDATE vehicles
SET current_spot_id=(
  SELECT s.id
  FROM _tower_vehicle_resequence_0036 r
  JOIN _tower_targets_0036 t ON t.ordinal=r.ordinal
  JOIN parking_spots s ON s.zone_id='tower' AND s.label=t.label
  WHERE r.vehicle_id=vehicles.id
),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_vehicle_resequence_0036);

DROP TABLE _tower_targets_0036;
DROP TABLE _tower_vehicle_resequence_0036;
