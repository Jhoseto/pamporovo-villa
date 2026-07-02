CREATE TABLE `client_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(32),
	`phone_normalized` varchar(32),
	`email` varchar(320),
	`notes` text,
	`is_vip` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guest_name` varchar(255) NOT NULL,
	`guest_email` varchar(320),
	`rating` int NOT NULL,
	`body` text NOT NULL,
	`villa_id` varchar(32),
	`stay_period` varchar(128),
	`is_published` boolean NOT NULL DEFAULT false,
	`source` enum('website','admin') NOT NULL DEFAULT 'website',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customer_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `booking_requests` MODIFY COLUMN `status` enum('pending','confirmed','completed','rejected') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `admin_users` ADD `notification_sound_token` varchar(64);--> statement-breakpoint
ALTER TABLE `admin_users` ADD `notification_sound_ext` varchar(8);--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `guest_phone_normalized` varchar(32);--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `total_amount_eur` int;--> statement-breakpoint
ALTER TABLE `booking_requests` ADD `deposit_paid_eur` int DEFAULT 0;--> statement-breakpoint
CREATE INDEX `client_contacts_phone_idx` ON `client_contacts` (`phone_normalized`);--> statement-breakpoint
CREATE INDEX `client_contacts_name_idx` ON `client_contacts` (`full_name`);--> statement-breakpoint
CREATE INDEX `customer_reviews_published_idx` ON `customer_reviews` (`is_published`);--> statement-breakpoint
CREATE INDEX `customer_reviews_created_idx` ON `customer_reviews` (`created_at`);--> statement-breakpoint
CREATE INDEX `booking_guest_phone_norm_idx` ON `booking_requests` (`guest_phone_normalized`);