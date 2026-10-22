-- 6층 A05~C06 여섯 칸을 배정 불가 상태로 전환합니다.
UPDATE parking_spots
SET active=0, updated_at=CURRENT_TIMESTAMP
WHERE zone_id='pillar11'
  AND label IN ('A05','B05','C05','A06','B06','C06');
