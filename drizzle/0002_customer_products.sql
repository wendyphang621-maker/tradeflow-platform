CREATE TABLE `customer_research` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`company` text NOT NULL,
	`website` text NOT NULL,
	`industry` text DEFAULT '待确认' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`emails` text DEFAULT '' NOT NULL,
	`phones` text DEFAULT '' NOT NULL,
	`source_title` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`model` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`specification` text DEFAULT '' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
