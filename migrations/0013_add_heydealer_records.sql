PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS heydealer_records (
  id TEXT PRIMARY KEY,
  manager TEXT NOT NULL DEFAULT '',
  record_date TEXT NOT NULL,
  model_year TEXT NOT NULL DEFAULT '',
  plate TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  customer_type TEXT NOT NULL CHECK(customer_type IN ('개인','법인')),
  options TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  account TEXT NOT NULL DEFAULT '',
  origin TEXT NOT NULL DEFAULT '',
  departure_time TEXT NOT NULL DEFAULT '',
  raw_pickup_text TEXT NOT NULL DEFAULT '',
  raw_payment_text TEXT NOT NULL DEFAULT '',
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_heydealer_records_date ON heydealer_records(record_date DESC,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_heydealer_records_plate ON heydealer_records(plate,created_at DESC);

CREATE TABLE IF NOT EXISTS heydealer_files (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL REFERENCES heydealer_records(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK(size_bytes >= 0),
  uploaded_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_heydealer_files_record ON heydealer_files(record_id,created_at DESC);

PRAGMA optimize;
