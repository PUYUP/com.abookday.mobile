ALTER TABLE `books` ADD `last_read_page` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `books` ADD `status` text DEFAULT 'reading' NOT NULL;