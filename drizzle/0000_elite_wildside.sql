CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`isbn` text,
	`cover_url` text,
	`total_pages` integer NOT NULL,
	`genre` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	`user_uuid` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);