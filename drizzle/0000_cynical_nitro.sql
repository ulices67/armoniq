CREATE TABLE `completions` (
	`user_id` text NOT NULL,
	`instrument` text NOT NULL,
	`lesson_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `instrument`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `favorites` (
	`user_id` text NOT NULL,
	`item_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `item_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`instrument` text NOT NULL,
	`level` text NOT NULL,
	`goal` text NOT NULL,
	`minutes` integer NOT NULL,
	`settings` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`instrument` text NOT NULL,
	`kind` text NOT NULL,
	`started_at` integer NOT NULL,
	`finished_at` integer,
	`seconds` integer DEFAULT 0 NOT NULL,
	`score` integer,
	`observations` text DEFAULT '{}' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_sessions_user_started` ON `sessions` (`user_id`,`started_at`);