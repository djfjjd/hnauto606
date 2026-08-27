PRAGMA foreign_keys = ON;

CREATE TABLE _preview_import_20260827 (plate TEXT NOT NULL, model TEXT NOT NULL, color TEXT NOT NULL, zone_id TEXT NOT NULL);
INSERT INTO _preview_import_20260827 VALUES
('186저9439','쏘나타','흰색','pillar11'),('332거4844','QM6','기타','pillar11'),('104누5036','320i','흰색','pillar11'),('56거2704','아반떼AD','흰색','pillar11'),('289무7006','미니쿠퍼','빨강','pillar11'),
('335모6853','A6','흰색','pillar11'),('56마7937','XC60','흰색','pillar11'),('167조3574','320i','검정','pillar11'),('383다3500','코나','회색','pillar11'),('257저9955','S350d','검정','pillar11'),
('112부3532','Q7','회색','pillar11'),('210부1269','캐스퍼','흰색','pillar11'),('51보1818','스포티지','검정','pillar11'),('242부9198','E300','흰색','pillar11'),('170누6876','E220d','흰색','pillar11'),
('106오3833','530i','회색','pillar11'),('290모2278','아반떼','흰색','pillar11'),('143루5988','X7','흰색','pillar11'),('10구7805','티볼리','흰색','pillar11'),('348누5827','A6','회색','pillar11'),('352거9633','530i','검정','pillar11'),
('164로3630','X7','검정','auto13'),('62라8424','투싼','회색','auto13'),('61부3226','530i','검정','auto13'),('07두4248','레니게이드','흰색','auto13'),('216너8539','레니게이드','흰색','auto13'),('04고2790','Q5','검정','auto13'),
('57다4891','아반떼AD','회색','roof'),('156하9280','아반떼','흰색','roof'),('249라5370','X4','흰색','roof'),('282다4020','푸조3008','흰색','roof'),('28도3661','디스커버리','회색','roof'),('04고9662','링컨 컨티넨탈','검정','roof'),
('190로6856','토레스','흰색','roof'),('09주4268','알티마','흰색','roof'),('50고3422','캠리','은색','roof'),('59버5186','렉스턴','검정','roof'),('31소6231','A4','은색','roof'),('328가3298','GLB','흰색','roof'),('59다3609','모하비','회색','roof'),('42루7601','쏘렌토','회색','roof'),('97수0945','스타렉스','은색','roof'),
('256러5256','S60','회색','b3'),('152로9903','520i','흰색','b3'),
('05서0807','X1','회색','tower'),('08어2109','스팅어','회색','tower'),('69두9567','X1','흰색','tower'),('141라2216','A4','검정','tower'),('310주4121','A4','회색','tower'),('229오5495','Q7','흰색','tower'),
('06무4579','430i','회색','tower'),('246루7446','레니게이드','흰색','tower'),('217주9214','A220','흰색','tower'),('330무5458','X1','회색','tower'),('261도1412','카니발','흰색','tower'),('163고7334','레니게이드','검정','tower'),
('42보6676','118d','흰색','tower'),('151마1779','그랜저IG','검정','tower'),('323로9939','싼타페','검정','tower'),('48오6194','알티마','회색','tower'),('42너0107','컨트리맨','파랑','tower'),('26더6881','X3','회색','tower'),
('107구6293','BMW X4','검정','b5'),('50로3875','E220d 카브리올레','흰색','b5'),('39도3632','벤츠 E350','은색','b5'),('04거8280','520d','흰색','b5'),('10부2087','레인지로버','흰색','b5'),('26조9511','스포티지','흰색','b5'),('179로1163','E220d','회색','b5'),('249라5370','X4','흰색','b5'),('270오1289','쏘나타','흰색','b5'),('108주7275','GV80','흰색','b5'),
('272러3512','재규어XE','흰색','body');

-- 가져오기 전제조건이 바뀌면 CHECK 제약으로 전체 가져오기를 실패시킨다.
CREATE TABLE _preview_import_guard_20260827 (ok INTEGER NOT NULL CHECK(ok=1));
INSERT INTO _preview_import_guard_20260827
SELECT CASE WHEN (SELECT COUNT(*) FROM _preview_import_20260827)=73
 AND (SELECT COUNT(DISTINCT plate) FROM _preview_import_20260827)=72
 AND (SELECT COUNT(*) FROM _preview_import_20260827 WHERE plate='249라5370')=2
 AND NOT EXISTS (SELECT 1 FROM vehicles v JOIN _preview_import_20260827 i ON i.plate=v.plate WHERE v.checked_out_at IS NULL)
 AND NOT EXISTS (
   SELECT 1 FROM (SELECT zone_id,COUNT(*) needed FROM _preview_import_20260827 WHERE plate<>'249라5370' GROUP BY zone_id) n
   LEFT JOIN (SELECT zone_id,COUNT(*) available FROM parking_spots WHERE current_vehicle_id IS NULL AND active=1 GROUP BY zone_id) a ON a.zone_id=n.zone_id
   WHERE COALESCE(a.available,0)<n.needed
 ) THEN 1 ELSE 0 END;

INSERT OR IGNORE INTO users(id,email,name,role,active) VALUES('system-preview-import','preview-import@hana-auto.invalid','초기 데이터 가져오기','admin',1);

CREATE TABLE _preview_assignments_20260827 AS
WITH incoming AS (
 SELECT i.*,ROW_NUMBER() OVER(PARTITION BY i.zone_id ORDER BY i.rowid) rn
 FROM _preview_import_20260827 i WHERE i.plate<>'249라5370'
), empty_spots AS (
 SELECT s.id spot_id,s.zone_id,ROW_NUMBER() OVER(PARTITION BY s.zone_id ORDER BY s.label,s.id) rn
 FROM parking_spots s WHERE s.current_vehicle_id IS NULL AND s.active=1
)
SELECT lower(hex(randomblob(16))) vehicle_id,incoming.plate,incoming.model,incoming.color,incoming.zone_id,empty_spots.spot_id
FROM incoming JOIN empty_spots ON empty_spots.zone_id=incoming.zone_id AND empty_spots.rn=incoming.rn;

INSERT INTO vehicles(id,plate,model,color,current_spot_id,checked_in_at,created_at,updated_at)
SELECT vehicle_id,plate,model,color,spot_id,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP FROM _preview_assignments_20260827;

UPDATE parking_spots SET current_vehicle_id=(SELECT vehicle_id FROM _preview_assignments_20260827 a WHERE a.spot_id=parking_spots.id),version=version+1,updated_at=CURRENT_TIMESTAMP
WHERE id IN (SELECT spot_id FROM _preview_assignments_20260827) AND current_vehicle_id IS NULL;

INSERT INTO parking_movements(id,vehicle_id,movement_type,from_spot_id,to_spot_id,actor_user_id,note)
SELECT lower(hex(randomblob(16))),vehicle_id,'check_in',NULL,spot_id,'system-preview-import','PDF 초기 입고 데이터 등록' FROM _preview_assignments_20260827;

INSERT INTO audit_logs(id,actor_user_id,action,entity_type,entity_id,details_json)
SELECT lower(hex(randomblob(16))),'system-preview-import','initial_import','vehicle',vehicle_id,json_object('source','parking PDF','spotId',spot_id) FROM _preview_assignments_20260827;

DROP TABLE _preview_assignments_20260827;
DROP TABLE _preview_import_guard_20260827;
DROP TABLE _preview_import_20260827;
PRAGMA optimize;
