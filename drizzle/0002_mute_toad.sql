PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text,
	`isbn` text,
	`cover_url` text,
	`total_pages` integer NOT NULL,
	`last_read_page` integer DEFAULT 0,
	`genres` text,
	`status` text DEFAULT 'reading' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`user_uuid` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_books`("id", "title", "author", "isbn", "cover_url", "total_pages", "last_read_page", "genres", "status", "created_at", "user_uuid") SELECT "id", "title", "author", "isbn", "cover_url", "total_pages", "last_read_page", "genres", "status", "created_at", "user_uuid" FROM `books`;--> statement-breakpoint
DROP TABLE `books`;--> statement-breakpoint
ALTER TABLE `__new_books` RENAME TO `books`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `books_isbn_unique` ON `books` (`isbn`);