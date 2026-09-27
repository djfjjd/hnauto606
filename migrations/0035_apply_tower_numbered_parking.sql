-- 새싹타워 실제 주차번호 중 X 표시 구역을 제외한 좌표만 활성화합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower';

UPDATE parking_spots SET active=1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND (
  (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 7 AND 8)
  OR (substr(label,1,1) BETWEEN 'E' AND 'F' AND CAST(substr(label,2) AS INTEGER)=1)
  OR (substr(label,1,1) BETWEEN 'I' AND 'L' AND CAST(substr(label,2) AS INTEGER)=1)
  OR (substr(label,1,1)='M' AND CAST(substr(label,2) AS INTEGER) BETWEEN 2 AND 7)
  OR (substr(label,1,1)='D' AND CAST(substr(label,2) AS INTEGER) BETWEEN 17 AND 21)
  OR (substr(label,1,1)='A' AND CAST(substr(label,2) AS INTEGER) IN (16,17,19,20,21,22,23,24,25))
  OR (substr(label,1,1) BETWEEN 'B' AND 'G' AND CAST(substr(label,2) AS INTEGER)=14)
);
