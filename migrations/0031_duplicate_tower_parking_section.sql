-- 새싹타워 A01~M13의 활성 주차면 구성을 A14~M26에 복제합니다.
INSERT OR IGNORE INTO parking_spots(id,zone_id,label)
WITH RECURSIVE
  rows(value) AS (SELECT 14 UNION ALL SELECT value+1 FROM rows WHERE value<26),
  cols(value) AS (SELECT 1 UNION ALL SELECT value+1 FROM cols WHERE value<13),
  positions(label) AS (
    SELECT char(64+cols.value)||printf('%02d',rows.value)
    FROM rows CROSS JOIN cols
    WHERE
      (rows.value=14 AND cols.value BETWEEN 2 AND 12)
      OR (cols.value=1 AND rows.value BETWEEN 15 AND 26)
      OR (cols.value=4 AND rows.value BETWEEN 17 AND 21)
      OR (cols.value=10 AND rows.value BETWEEN 17 AND 21)
      OR (cols.value=13 AND rows.value BETWEEN 15 AND 21)
  )
SELECT 'tower-grid-'||label,'tower',label FROM positions;

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND (
  (CAST(substr(label,2) AS INTEGER)=14 AND substr(label,1,1) BETWEEN 'B' AND 'L')
  OR (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 26)
  OR (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 17 AND 21)
  OR (substr(label,1,1)='J' AND CAST(substr(label,2) AS INTEGER) BETWEEN 17 AND 21)
  OR (substr(label,1,1)='M' AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 21)
);
