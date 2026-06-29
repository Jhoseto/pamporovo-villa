-- Phase 3 admin schema (idempotent — безопасно за повторно пускане)
-- По-лесно: pnpm db:sync

ALTER TABLE booking_requests
  ADD COLUMN IF NOT EXISTS admin_tags_json text NOT NULL DEFAULT ('[]') AFTER admin_note;

CREATE TABLE IF NOT EXISTS admin_reminder_log (
  id int NOT NULL AUTO_INCREMENT,
  reminder_key varchar(64) NOT NULL,
  sent_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_reminder_log_reminder_key_unique (reminder_key)
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id int NOT NULL AUTO_INCREMENT,
  villa_id varchar(32) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  note varchar(255) DEFAULT NULL,
  created_by_admin_id int DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY blocked_villa_dates_idx (villa_id, start_date)
);

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS token_version int NOT NULL DEFAULT 0;
