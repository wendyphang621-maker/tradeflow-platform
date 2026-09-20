CREATE TABLE `deals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`customer` text NOT NULL,
	`product` text NOT NULL,
	`amount` integer NOT NULL,
	`stage` text DEFAULT 'inquiry' NOT NULL,
	`next_action` text DEFAULT '安排首次联系' NOT NULL,
	`owner` text DEFAULT 'Wendy' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
