PRAGMA defer_foreign_keys = TRUE;

CREATE TABLE vehicle_status_new (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
  status_type TEXT NOT NULL CHECK(status_type IN (
    'coolant-low','light','battery','engine','engine-oil-low','oil-pressure',
    'urea','fuel','tire','master-warning','abs','key','other'
  )),
  active INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  actor_user_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vehicle_status_new(id,vehicle_id,status_type,active,note,actor_user_id,created_at,updated_at)
SELECT id,vehicle_id,status_type,active,note,actor_user_id,created_at,updated_at
FROM vehicle_status;

DROP TABLE vehicle_status;
ALTER TABLE vehicle_status_new RENAME TO vehicle_status;
CREATE INDEX idx_vehicle_status_active ON vehicle_status(vehicle_id,active);
