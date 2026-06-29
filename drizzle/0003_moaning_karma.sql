CREATE TABLE IF NOT EXISTS `admin_reminder_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reminder_key` varchar(64) NOT NULL,
	`sent_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_reminder_log_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_reminder_log_reminder_key_unique` UNIQUE(`reminder_key`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `blocked_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villa_id` varchar(32) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`note` varchar(255),
	`created_by_admin_id` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blocked_dates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `booking_requests` ADD COLUMN IF NOT EXISTS `admin_tags_json` text DEFAULT ('[]') NOT NULL;--> statement-breakpoint
CREATE INDEX `blocked_villa_dates_idx` ON `blocked_dates` (`villa_id`,`start_date`);--> statement-breakpoint
CREATE INDEX `booking_villa_status_idx` ON `booking_requests` (`villa_id`,`status`);--> statement-breakpoint
CREATE INDEX `booking_dates_idx` ON `booking_requests` (`check_in_date`,`check_out_date`);--> statement-breakpoint
CREATE INDEX `booking_status_idx` ON `booking_requests` (`status`);