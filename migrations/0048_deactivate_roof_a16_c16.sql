-- 제거된 옥상 A16·C16 병합 주차면을 빈자리일 때 비활성화합니다.
UPDATE parking_spots SET active=0,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='roof' AND label IN ('A16','C16') AND current_vehicle_id IS NULL;
