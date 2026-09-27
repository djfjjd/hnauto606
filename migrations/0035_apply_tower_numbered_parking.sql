-- 새싹타워 실제 주차번호(B5 01~05·07~40, B6 01~22)에 해당하는 좌표만 활성화합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower';

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND (
  (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 4 AND 8)
  OR (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) BETWEEN 2 AND 12)
  OR (substr(label,1,1) BETWEEN 'B' AND 'L' AND CAST(substr(label,2) AS INTEGER)=1)
  OR (substr(label,1,1)='M' AND CAST(substr(label,2) AS INTEGER) BETWEEN 2 AND 8)
  OR (substr(label,1,1)='J' AND CAST(substr(label,2) AS INTEGER) BETWEEN 4 AND 8)
  OR (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 17 AND 21)
  OR (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) BETWEEN 15 AND 25)
  OR (substr(label,1,1) BETWEEN 'B' AND 'G' AND CAST(substr(label,2) AS INTEGER)=14)
);
