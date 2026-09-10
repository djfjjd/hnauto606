CREATE TABLE trusted_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  device_key TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  last_used_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, device_key)
);

CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id, revoked_at, last_used_at DESC);
CREATE INDEX idx_trusted_devices_token ON trusted_devices(token_hash, revoked_at);

PRAGMA optimize;
