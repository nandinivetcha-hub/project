import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  unit: integer("unit"),
  fileType: text("file_type").notNull(),
  keywords: text("keywords"),
  branch: text("branch").notNull(),
  year: text("year").notNull(),
  semester: text("semester").notNull(),
  driveLink: text("drive_link").notNull(),
  uploadDate: timestamp("upload_date", { withTimezone: true }).notNull().defaultNow(),
  downloads: integer("downloads").notNull().default(0),
  uploadedBy: integer("uploaded_by"),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ id: true, uploadDate: true, downloads: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileRecord = typeof filesTable.$inferSelect;
