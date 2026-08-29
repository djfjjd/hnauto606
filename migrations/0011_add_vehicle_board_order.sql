ALTER TABLE vehicles ADD COLUMN board_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_vehicles_manager_board_order_active
ON vehicles(manager, board_order, checked_out_at);
