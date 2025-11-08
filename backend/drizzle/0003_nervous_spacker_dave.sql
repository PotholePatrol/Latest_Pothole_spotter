ALTER TABLE `users` RENAME COLUMN `phone` TO `phone_number`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_phone_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_number_unique` UNIQUE(`phone_number`);