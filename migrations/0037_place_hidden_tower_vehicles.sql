-- 현재 보이는 네 차량은 유지하고, 숨겨진 새싹타워 차량 14대를 B5 27번 이후와 B6 01~06번에 배치합니다.
-- 과거 이동 중 한쪽 위치 연결만 남은 차량도 찾을 수 있도록 vehicles와 parking_spots 양쪽 연결을 확인합니다.
CREATE TABLE _tower_hidden_vehicle_resequence_0037 (
  ordinal INTEGER PRIMARY KEY,
  vehicle_id TEXT NOT NULL UNIQUE
);

INSERT INTO _tower_hidden_vehicle_resequence_0037(ordinal,vehicle_id)
SELECT ROW_NUMBER() OVER (ORDER BY
  CASE
    WHEN substr(source_label,1,1)='D' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 4 AND 8 THEN CAST(substr(source_label,2) AS INTEGER)-3
    WHEN substr(source_label,1,1)='A' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 2 AND 12 THEN 19-CAST(substr(source_label,2) AS INTEGER)
    WHEN substr(source_label,1,1) BETWEEN 'B' AND 'L' AND CAST(substr(source_label,2) AS INTEGER)=1 THEN unicode(substr(source_label,1,1))-48
    WHEN substr(source_label,1,1)='M' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 2 AND 8 THEN CAST(substr(source_label,2) AS INTEGER)+27
    WHEN substr(source_label,1,1)='J' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 4 AND 8 THEN 44-CAST(substr(source_label,2) AS INTEGER)
    WHEN substr(source_label,1,1)='D' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 17 AND 21 THEN 100+CAST(substr(source_label,2) AS INTEGER)-16
    WHEN substr(source_label,1,1)='A' AND CAST(substr(source_label,2) AS INTEGER) BETWEEN 15 AND 25 THEN 100+31-CAST(substr(source_label,2) AS INTEGER)
    WHEN substr(source_label,1,1) BETWEEN 'B' AND 'G' AND CAST(substr(source_label,2) AS INTEGER)=14 THEN 100+unicode(substr(source_label,1,1))-49
    ELSE 999
  END,
  created_at,
  vehicle_id
) AS ordinal,vehicle_id
FROM (
  SELECT v.id vehicle_id,v.created_at,COALESCE(vehicle_spot.label,board_spot.label) source_label
  FROM vehicles v
  LEFT JOIN parking_spots vehicle_spot ON vehicle_spot.id=v.current_spot_id AND vehicle_spot.zone_id='tower'
  LEFT JOIN parking_spots board_spot ON board_spot.current_vehicle_id=v.id AND board_spot.zone_id='tower'
  WHERE (vehicle_spot.id IS NOT NULL OR board_spot.id IS NOT NULL)
    AND substr(replace(v.plate,' ',''),-4) NOT IN ('4121','2927','9214','6856')
)
ORDER BY ordinal
LIMIT 14;

CREATE TABLE _tower_hidden_targets_0037 (
  ordinal INTEGER PRIMARY KEY,
  label TEXT NOT NULL UNIQUE
);

INSERT INTO _tower_hidden_targets_0037(ordinal,label) VALUES
  (1,'K01'),(2,'L01'),
  (3,'M02'),(4,'M03'),(5,'M04'),(6,'M05'),(7,'M06'),(8,'M07'),
  (9,'D17'),(10,'D18'),(11,'D19'),(12,'D20'),(13,'D21'),(14,'A25');

UPDATE parking_spots
SET current_vehicle_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE current_vehicle_id IN (SELECT vehicle_id FROM _tower_hidden_vehicle_resequence_0037);

UPDATE vehicles
SET current_spot_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_hidden_vehicle_resequence_0037);

UPDATE parking_spots
SET current_vehicle_id=(
  SELECT r.vehicle_id
  FROM _tower_hidden_targets_0037 t
  JOIN _tower_hidden_vehicle_resequence_0037 r ON r.ordinal=t.ordinal
  WHERE t.label=parking_spots.label
),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower'
  AND label IN (SELECT label FROM _tower_hidden_targets_0037)
  AND EXISTS (
    SELECT 1
    FROM _tower_hidden_targets_0037 t
    JOIN _tower_hidden_vehicle_resequence_0037 r ON r.ordinal=t.ordinal
    WHERE t.label=parking_spots.label
  );

UPDATE vehicles
SET current_spot_id=(
  SELECT s.id
  FROM _tower_hidden_vehicle_resequence_0037 r
  JOIN _tower_hidden_targets_0037 t ON t.ordinal=r.ordinal
  JOIN parking_spots s ON s.zone_id='tower' AND s.label=t.label
  WHERE r.vehicle_id=vehicles.id
),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_hidden_vehicle_resequence_0037);

DROP TABLE _tower_hidden_targets_0037;
DROP TABLE _tower_hidden_vehicle_resequence_0037;
