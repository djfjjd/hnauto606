-- 지정된 새싹 차량 12대를 B5 27~34번과 B6 01~04번에 고정 배치합니다.
CREATE TABLE _tower_named_placements_0039(ending TEXT PRIMARY KEY,label TEXT NOT NULL UNIQUE);
INSERT INTO _tower_named_placements_0039(ending,label) VALUES
  ('9511','K01'),('9439','L01'),('8424','M02'),('6676','M03'),
  ('4579','M04'),('7601','M05'),('4124','M06'),('4248','M07'),
  ('7446','D17'),('1626','D18'),('6691','D19'),('5495','D20');

CREATE TABLE _tower_named_vehicles_0039(ending TEXT PRIMARY KEY,label TEXT NOT NULL UNIQUE,vehicle_id TEXT UNIQUE);
INSERT INTO _tower_named_vehicles_0039(ending,label,vehicle_id)
SELECT p.ending,p.label,(
  SELECT v.id FROM vehicles v
  WHERE substr(replace(v.plate,' ',''),-4)=p.ending
  ORDER BY (v.checked_out_at IS NULL) DESC,v.updated_at DESC LIMIT 1
) FROM _tower_named_placements_0039 p;

UPDATE vehicles SET current_spot_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE current_spot_id IN (
  SELECT s.id FROM parking_spots s JOIN _tower_named_vehicles_0039 p ON p.label=s.label WHERE s.zone_id='tower'
);
UPDATE parking_spots SET current_vehicle_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND (
  label IN (SELECT label FROM _tower_named_vehicles_0039)
  OR current_vehicle_id IN (SELECT vehicle_id FROM _tower_named_vehicles_0039 WHERE vehicle_id IS NOT NULL)
);
UPDATE vehicles SET current_spot_id=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_named_vehicles_0039 WHERE vehicle_id IS NOT NULL);
UPDATE parking_spots
SET current_vehicle_id=(SELECT p.vehicle_id FROM _tower_named_vehicles_0039 p WHERE p.label=parking_spots.label),active=1,version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE zone_id='tower' AND label IN (SELECT label FROM _tower_named_vehicles_0039 WHERE vehicle_id IS NOT NULL);
UPDATE vehicles
SET current_spot_id=(SELECT s.id FROM _tower_named_vehicles_0039 p JOIN parking_spots s ON s.zone_id='tower' AND s.label=p.label WHERE p.vehicle_id=vehicles.id),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT vehicle_id FROM _tower_named_vehicles_0039 WHERE vehicle_id IS NOT NULL);

DROP TABLE _tower_named_vehicles_0039;
DROP TABLE _tower_named_placements_0039;
