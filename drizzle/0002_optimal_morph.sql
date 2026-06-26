CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(64) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`is_master` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`price_eur` int NOT NULL,
	`old_price_eur` int NOT NULL,
	`period` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`includes_json` text NOT NULL,
	`is_published` boolean NOT NULL DEFAULT false,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `offers_id` PRIMARY KEY(`id`),
	CONSTRAINT `offers_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `pricing_extras` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`amount_eur` int NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_extras_id` PRIMARY KEY(`id`),
	CONSTRAINT `pricing_extras_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admin_user_id` int NOT NULL,
	`endpoint` varchar(512) NOT NULL,
	`p256dh` varchar(255) NOT NULL,
	`auth` varchar(255) NOT NULL,
	`user_agent` varchar(512),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `push_subscriptions_endpoint_unique` UNIQUE(`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `villa_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villa_id` varchar(32) NOT NULL,
	`tier_key` varchar(32) NOT NULL,
	`tier_label` varchar(128) NOT NULL,
	`winter_per_night` int NOT NULL,
	`summer_per_night` int NOT NULL,
	`sort_order` int NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `villa_pricing_id` PRIMARY KEY(`id`),
	CONSTRAINT `villa_tier_idx` UNIQUE(`villa_id`,`tier_key`)
);
--> statement-breakpoint
DROP TABLE `inquiries`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `booking_requests` MODIFY COLUMN `guest_email` varchar(320);--> statement-breakpoint
ALTER TABLE `booking_requests` MODIFY COLUMN `guest_phone` varchar(32);--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `villa_id` varchar(32) NOT NULL;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `guest_note` text;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `admin_note` text;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `source` enum('website','manual') DEFAULT 'website' NOT NULL;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `created_by_admin_id` int;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `processed_at` timestamp;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `processed_by_admin_id` int;--> statement-breakpoint
ALTER TABLE `booking_requests` DROP COLUMN `special_requests`;