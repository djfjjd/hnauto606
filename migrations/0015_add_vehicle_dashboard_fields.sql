ALTER TABLE vehicles ADD COLUMN mileage TEXT NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN performance_checked INTEGER NOT NULL DEFAULT 0 CHECK(performance_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN polishing_checked INTEGER NOT NULL DEFAULT 0 CHECK(polishing_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN advertising_checked INTEGER NOT NULL DEFAULT 0 CHECK(advertising_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN performance_date_checked INTEGER NOT NULL DEFAULT 0 CHECK(performance_date_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN underbody_checked INTEGER NOT NULL DEFAULT 0 CHECK(underbody_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN bodywork_checked INTEGER NOT NULL DEFAULT 0 CHECK(bodywork_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN dent_checked INTEGER NOT NULL DEFAULT 0 CHECK(dent_checked IN (0,1));
ALTER TABLE vehicles ADD COLUMN repair_checked INTEGER NOT NULL DEFAULT 0 CHECK(repair_checked IN (0,1));
