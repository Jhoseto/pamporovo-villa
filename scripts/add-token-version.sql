-- Run once if token_version column is missing (after schema update):
-- mysql -u root pamporovo_villa < scripts/add-token-version.sql

ALTER TABLE `admin_users`
  ADD COLUMN IF NOT EXISTS `token_version` int NOT NULL DEFAULT 0;
