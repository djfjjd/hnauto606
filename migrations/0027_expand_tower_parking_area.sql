-- 새싹타워의 확장 도면에서 실제 배정 가능한 주차면을 추가합니다.
-- 기존 B5·B6 20면(A01~J02)은 유지합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM rows WHERE value<13),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<13),
  positions(label) AS (
    SELECT char(64+cols.value)||printf('%02d',rows.value)
    FROM rows CROSS JOIN cols
    WHERE
      (rows.value BETWEEN 1 AND 2 AND cols.value BETWEEN 1 AND 10)
      OR rows.value=1
      OR cols.value=1
      OR (cols.value=5 AND rows.value BETWEEN 3 AND 8)
      OR (cols.value=11 AND rows.value BETWEEN 3 AND 8)
      OR (cols.value=13 AND rows.value BETWEEN 1 AND 8)
  )
SELECT 'tower-grid-'||label,'tower',label FROM positions;

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND (
  (substr(label,1,1) BETWEEN 'A' AND 'J' AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 2)
  OR CAST(substr(label,2) AS INTEGER)=1
  OR (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) BETWEEN 2 AND 13)
  OR (substr(label,1,1)='E' AND CAST(substr(label,2) AS INTEGER) BETWEEN 3 AND 8)
  OR (substr(label,1,1)='K' AND CAST(substr(label,2) AS INTEGER) BETWEEN 3 AND 8)
  OR (substr(label,1,1)='M' AND CAST(substr(label,2) AS INTEGER) BETWEEN 1 AND 8)
);
