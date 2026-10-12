-- 대표님 차량현황 순번 3~6의 기존 성능일을 재성능일로 이관하고,
-- 성능일은 각 차량의 입고일로 바로잡는다.
INSERT OR IGNORE INTO service_records (
  id, vehicle_id, service_type, status, spot_id, note,
  started_at, completed_at, actor_user_id, created_at, updated_at
)
SELECT
  'reperformance-correction-20261012-' || sr.vehicle_id,
  sr.vehicle_id,
  'other',
  'complete',
  sr.spot_id,
  '[재성능]',
  sr.started_at,
  COALESCE(sr.completed_at, sr.started_at),
  sr.actor_user_id,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM service_records sr
JOIN vehicles v ON v.id = sr.vehicle_id
WHERE sr.id IN (
  'perf-import-20260904-3671df5e-f9b8-434b-b3ad-84608e9c91fb',
  'perf-import-20260904-4ea66292d51aa8a3aa22b0604e8acecd',
  'perf-import-20260904-e3e838da54bf1a973027de7c2dd46330',
  'perf-import-20260904-9789c842c6c6ba4b3b31a47050ebad2f'
)
AND v.manager = '대표님'
AND v.checked_out_at IS NULL
AND NOT EXISTS (
  SELECT 1
  FROM service_records existing
  WHERE existing.vehicle_id = sr.vehicle_id
    AND existing.note LIKE '[재성능]%'
);

UPDATE service_records
SET
  started_at = (SELECT checked_in_at FROM vehicles WHERE vehicles.id = service_records.vehicle_id),
  completed_at = (SELECT checked_in_at FROM vehicles WHERE vehicles.id = service_records.vehicle_id),
  updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  'perf-import-20260904-3671df5e-f9b8-434b-b3ad-84608e9c91fb',
  'perf-import-20260904-4ea66292d51aa8a3aa22b0604e8acecd',
  'perf-import-20260904-e3e838da54bf1a973027de7c2dd46330',
  'perf-import-20260904-9789c842c6c6ba4b3b31a47050ebad2f'
)
AND vehicle_id IN (
  SELECT id
  FROM vehicles
  WHERE manager = '대표님'
    AND checked_out_at IS NULL
);
