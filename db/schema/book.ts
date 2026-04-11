import { sql } from "drizzle-orm";
import * as p from "drizzle-orm/sqlite-core";

export const BOOK_STATUS = {
  READING: 'reading',
  ARCHIVE: 'archive',
  FINISH: 'finish',
  PAUSE: 'pause',
} as const;

export type BookStatus = typeof BOOK_STATUS[keyof typeof BOOK_STATUS];

export type Genre = {
  code: string;
  genre: string;
};

export const GENRES = [
  {"code":"ANT000000","genre":"Antiques & Collectibles"},
  {"code":"ARC000000","genre":"Architecture"},
  {"code":"ART000000","genre":"Art"},
  {"code":"BIB000000","genre":"Bibles"},
  {"code":"BIO000000","genre":"Biography & Autobiography"},
  {"code":"BUS000000","genre":"Business & Economics"},
  {"code":"CGN000000","genre":"Comics & Graphic Novels"},
  {"code":"CKB000000","genre":"Cooking"},
  {"code":"COM000000","genre":"Computers"},
  {"code":"CRA000000","genre":"Crafts & Hobbies"},
  {"code":"DES000000","genre":"Design"},
  {"code":"DRA000000","genre":"Drama"},
  {"code":"EDU000000","genre":"Education"},
  {"code":"FAM000000","genre":"Family & Relationships"},
  {"code":"FIC000000","genre":"Fiction"},
  {"code":"FOR000000","genre":"Foreign Language Study"},
  {"code":"GAM000000","genre":"Games"},
  {"code":"GAR000000","genre":"Gardening"},
  {"code":"HEA000000","genre":"Health & Fitness"},
  {"code":"HIS000000","genre":"History"},
  {"code":"HOM000000","genre":"House & Home"},
  {"code":"HUM000000","genre":"Humor"},
  {"code":"JNF000000","genre":"Juvenile Nonfiction"},
  {"code":"JUV000000","genre":"Juvenile Fiction"},
  {"code":"LAN000000","genre":"Language Arts & Disciplines"},
  {"code":"LAW000000","genre":"Law"},
  {"code":"LCO000000","genre":"Literary Collections"},
  {"code":"LIT000000","genre":"Literary Criticism"},
  {"code":"MAT000000","genre":"Mathematics"},
  {"code":"MED000000","genre":"Medical"},
  {"code":"MUS000000","genre":"Music"},
  {"code":"NAT000000","genre":"Nature"},
  {"code":"OCC000000","genre":"Body, Mind & Spirit"},
  {"code":"PER000000","genre":"Performing Arts"},
  {"code":"PET000000","genre":"Pets"},
  {"code":"PHI000000","genre":"Philosophy"},
  {"code":"PHO000000","genre":"Photography"},
  {"code":"POE000000","genre":"Poetry"},
  {"code":"POL000000","genre":"Political Science"},
  {"code":"PSY000000","genre":"Psychology"},
  {"code":"REF000000","genre":"Reference"},
  {"code":"REL000000","genre":"Religion"},
  {"code":"SCI000000","genre":"Science"},
  {"code":"SEL000000","genre":"Self-Help"},
  {"code":"SOC000000","genre":"Social Science"},
  {"code":"SPO000000","genre":"Sports & Recreation"},
  {"code":"STU000000","genre":"Study Aids"},
  {"code":"TEC000000","genre":"Technology & Engineering"},
  {"code":"TRA000000","genre":"Transportation"},
  {"code":"TRU000000","genre":"True Crime"},
  {"code":"TRV000000","genre":"Travel"}
];

export const books = p.sqliteTable("books", {
  id:           p.integer("id").primaryKey({ autoIncrement: true }),
  title:        p.text("title").notNull(),
  author:       p.text("author"),
  isbn:         p.text("isbn").unique(),
  coverUrl:     p.text("cover_url"),
  totalPages:   p.integer("total_pages").notNull(),
  lastReadPage: p.integer("last_read_page").default(0),
  genres:       p.text("genres"),
  status:       p.text("status", { enum: ['reading', 'archive', 'finish', 'pause'] }).default('reading').notNull(),
  createdAt:    p.text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt:    p.text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  ownedBy:      p.text("user_uuid").notNull(), // the UUID coming from supabase auth
});