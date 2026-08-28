import fs from 'node:fs';

const source=fs.readFileSync(new URL('./import-preview-vehicles-20260827.sql',import.meta.url),'utf8');
const rows=[...source.matchAll(/\('([^']*)','([^']*)','([^']*)','[^']*'\)/g)].map(match=>match.slice(1,4));
const unique=[...new Map(rows.map(row=>[row[0],row])).values()].filter(row=>row[0]!=='106오3833');
const quote=value=>`'${value.replaceAll("'","''")}'`;
const values=unique.map(row=>`(${row.map(quote).join(',')})`).join(',');

process.stdout.write(`
PRAGMA foreign_keys=ON;
INSERT OR IGNORE INTO users(id,email,name,role,active) VALUES('shared-field-device','shared-device@hana-auto.invalid','현장 공용 기기','staff',1);
CREATE TABLE _board_import_20260828(plate TEXT PRIMARY KEY,model TEXT,color TEXT);
INSERT INTO _board_import_20260828 VALUES ${values};
INSERT INTO vehicles(id,plate,model,color,current_spot_id,checked_in_at)
SELECT lower(hex(randomblob(16))),i.plate,i.model,i.color,NULL,CURRENT_TIMESTAMP FROM _board_import_20260828 i
WHERE NOT EXISTS(SELECT 1 FROM vehicles v WHERE v.plate=i.plate AND v.checked_out_at IS NULL);
INSERT INTO parking_movements(id,vehicle_id,movement_type,from_spot_id,to_spot_id,actor_user_id,note)
SELECT lower(hex(randomblob(16))),v.id,'check_in',NULL,NULL,'shared-field-device','차량 현황판 일괄 등록'
FROM vehicles v JOIN _board_import_20260828 i ON i.plate=v.plate WHERE v.checked_out_at IS NULL
AND NOT EXISTS(SELECT 1 FROM parking_movements m WHERE m.vehicle_id=v.id);
INSERT INTO audit_logs(id,actor_user_id,action,entity_type,entity_id,details_json)
SELECT lower(hex(randomblob(16))),'shared-field-device','bulk_vehicle_board_import','vehicle',v.id,'{"location":"vehicle_board"}'
FROM vehicles v JOIN _board_import_20260828 i ON i.plate=v.plate WHERE v.checked_out_at IS NULL;
DROP TABLE _board_import_20260828;
`);
