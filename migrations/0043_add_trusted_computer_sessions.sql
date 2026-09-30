CREATE TABLE trusted_device_sessions (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES trusted_devices(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  user_agent TEXT NOT NULL DEFAULT '',
  last_used_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_trusted_device_sessions_token ON trusted_device_sessions(token_hash);
CREATE INDEX idx_trusted_device_sessions_device ON trusted_device_sessions(device_id, last_used_at DESC);

PRAGMA optimize;
