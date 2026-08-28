ALTER TABLE vehicles ADD COLUMN model_year TEXT NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN options TEXT NOT NULL DEFAULT '';
ALTER TABLE vehicles ADD COLUMN manager TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_vehicles_manager_active ON vehicles(manager, checked_out_at);

