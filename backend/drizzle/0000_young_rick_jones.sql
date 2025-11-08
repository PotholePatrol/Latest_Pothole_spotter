CREATE TABLE `contact_us_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`reply` varchar(255) NOT NULL,
	`message` varchar(1024) NOT NULL,
	`is_public` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`likes` json DEFAULT ('[]'),
	`dislikes` json DEFAULT ('[]'),
	CONSTRAINT `contact_us_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contact_us_feedback_reply` (
	`id` int AUTO_INCREMENT NOT NULL,
	`feedback_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`reply` varchar(255) NOT NULL,
	`message` varchar(1024) NOT NULL,
	`is_public` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`likes` json DEFAULT ('[]'),
	`dislikes` json DEFAULT ('[]'),
	CONSTRAINT `contact_us_feedback_reply_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detections` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`label` varchar(255),
	`image_url` varchar(255),
	`confidence` float,
	`lat` float,
	`lng` float,
	`stretch_start_lat` float,
	`stretch_start_lng` float,
	`stretch_end_lat` float,
	`stretch_end_lng` float,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `detections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_preferences` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`preferred_lat` float,
	`preferred_lng` float,
	CONSTRAINT `location_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`first_name` varchar(255) NOT NULL,
	`last_name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`phone` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`country` varchar(100) NOT NULL,
	`is_admin` boolean DEFAULT false,
	`profile_pic` varchar(255) DEFAULT 'https://th.bing.com/th/id/OIP.1yoSL-WO0YU5mQKROudvswHaHa?w=180&h=180&c=7&r=0&o=7&pid=1.7&rm=3',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
ALTER TABLE `contact_us_feedback_reply` ADD CONSTRAINT `contact_us_feedback_reply_feedback_id_contact_us_feedback_id_fk` FOREIGN KEY (`feedback_id`) REFERENCES `contact_us_feedback`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `location_preferences` ADD CONSTRAINT `location_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;