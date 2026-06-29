-- Add "completed" (Гостували) booking status
-- Or run: pnpm db:sync

ALTER TABLE booking_requests
  MODIFY COLUMN status enum('pending','confirmed','completed','rejected') NOT NULL DEFAULT 'pending';
