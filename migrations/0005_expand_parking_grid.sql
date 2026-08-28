-- 기존 주차면 ID와 차량 연결은 유지하고 라벨만 A01 형식으로 정규화합니다.
UPDATE parking_spots
SET label=substr(label,1,1)||printf('%02d',CAST(substr(label,2) AS INTEGER)),updated_at=CURRENT_TIMESTAMP
WHERE zone_id IN ('pillar11','b3','b5','roof','tower','auto13') AND label GLOB '[A-I][0-9]*';

-- 일반 주차층마다 9×20 기본 Grid에서 누락된 주차면만 추가합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM rows WHERE value<20),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<9),
  zones(id) AS (VALUES('pillar11'),('b3'),('b5'),('roof'),('tower'),('auto13'))
SELECT zones.id||'-grid-'||char(64+cols.value)||printf('%02d',rows.value),zones.id,char(64+cols.value)||printf('%02d',rows.value)
FROM zones CROSS JOIN rows CROSS JOIN cols;

