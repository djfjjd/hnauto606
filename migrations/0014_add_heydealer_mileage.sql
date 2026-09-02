ALTER TABLE heydealer_records ADD COLUMN mileage TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_heydealer_records_mileage ON heydealer_records(mileage);

PRAGMA optimize;
