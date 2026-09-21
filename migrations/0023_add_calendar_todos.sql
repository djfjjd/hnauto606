CREATE TABLE IF NOT EXISTS calendar_todos (
  id TEXT PRIMARY KEY,
  scheduled_date TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calendar_todos_date
ON calendar_todos(scheduled_date, created_at);
