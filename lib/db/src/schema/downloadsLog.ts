import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadsLogTable = pgTable("downloads_log", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull(),
  userId: integer("user_id"),
  downloadDate: timestamp("download_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDownloadLogSchema = createInsertSchema(downloadsLogTable).omit({ id: true, downloadDate: true });
export type InsertDownloadLog = z.infer<typeof insertDownloadLogSchema>;
export type DownloadLog = typeof downloadsLogTable.$inferSelect;
