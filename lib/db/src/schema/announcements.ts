import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("info"),
  datePosted: timestamp("date_posted", { withTimezone: true }).notNull().defaultNow(),
  postedBy: integer("posted_by"),
});

export const insertAnnouncementSchema = createInsertSchema(announcementsTable).omit({ id: true, datePosted: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcementsTable.$inferSelect;
