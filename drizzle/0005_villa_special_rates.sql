CREATE TABLE `villa_special_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`villa_id` varchar(32) NOT NULL,
	`start_date` date NOT NULL,
	`end_date` date NOT NULL,
	`price_per_night` int NOT NULL,
	`label` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `villa_special_rates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `special_villa_dates_idx` ON `villa_special_rates` (`villa_id`,`start_date`);
