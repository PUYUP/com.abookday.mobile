import * as p from "drizzle-orm/sqlite-core";

export const books = p.sqliteTable("books", {
  id:          p.integer("id").primaryKey({ autoIncrement: true }),
  title:       p.text("title").notNull(),
  author:      p.text("author"),
  isbn:        p.text("isbn").unique(),
  coverUrl:    p.text("cover_url"),
  totalPages:  p.integer("total_pages").notNull(),
  genre:       p.text("genre"),
  createdAt:   p.text("created_at").notNull().default("CURRENT_TIMESTAMP"),
  ownedBy:     p.text("user_uuid").notNull(), // the UUID coming from supabase auth
});