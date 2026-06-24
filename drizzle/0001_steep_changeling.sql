CREATE TABLE `booking_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`check_in_date` date NOT NULL,
	`check_out_date` date NOT NULL,
	`number_of_guests` int NOT NULL,
	`guest_name` varchar(255) NOT NULL,
	`guest_email` varchar(320) NOT NULL,
	`guest_phone` varchar(20) NOT NULL,
	`special_requests` text,
	`status` enum('pending','confirmed','rejected') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `booking_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitor_name` varchar(255) NOT NULL,
	`visitor_email` varchar(320) NOT NULL,
	`visitor_phone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','responded') NOT NULL DEFAULT 'new',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inquiries_id` PRIMARY KEY(`id`)
);
