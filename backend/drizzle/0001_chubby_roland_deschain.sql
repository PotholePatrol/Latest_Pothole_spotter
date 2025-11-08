ALTER TABLE `users` MODIFY COLUMN `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `phone` varchar(255);--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `country` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `is_google_account` boolean DEFAULT false;