import { Router, type IRouter } from "express";
import { sql, desc, gte } from "drizzle-orm";
import { db, filesTable, usersTable, downloadsLogTable, bookmarksTable } from "@workspace/db";
import { GetDownloadsOverTimeQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/analytics/dashboard", requireAdmin, async (_req, res): Promise<void> => {
  const [{ totalFiles }] = await db
    .select({ totalFiles: sql<number>`count(*)::int` })
    .from(filesTable);

  const [{ totalDownloads }] = await db
    .select({ totalDownloads: sql<number>`coalesce(sum(downloads), 0)::int` })
    .from(filesTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ downloadsToday }] = await db
    .select({ downloadsToday: sql<number>`count(*)::int` })
    .from(downloadsLogTable)
    .where(gte(downloadsLogTable.downloadDate, today));

  const [{ totalUsers }] = await db
    .select({ totalUsers: sql<number>`count(*)::int` })
    .from(usersTable);

  const [{ totalStudents }] = await db
    .select({ totalStudents: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(sql`role = 'student'`);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [{ newFilesThisWeek }] = await db
    .select({ newFilesThisWeek: sql<number>`count(*)::int` })
    .from(filesTable)
    .where(gte(filesTable.uploadDate, oneWeekAgo));

  const filesByType = await db
    .select({
      fileType: filesTable.fileType,
      count: sql<number>`count(*)::int`,
    })
    .from(filesTable)
    .groupBy(filesTable.fileType)
    .orderBy(desc(sql`count(*)`));

  const topSubjects = await db
    .select({
      subject: filesTable.subject,
      count: sql<number>`count(*)::int`,
    })
    .from(filesTable)
    .groupBy(filesTable.subject)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  res.json({
    totalFiles,
    totalDownloads,
    downloadsToday,
    totalUsers,
    totalStudents,
    newFilesThisWeek,
    filesByType,
    topSubjects,
  });
});

router.get("/analytics/downloads-over-time", requireAdmin, async (req, res): Promise<void> => {
  const params = GetDownloadsOverTimeQueryParams.safeParse(req.query);
  const days = (params.success && params.data.days) ? params.data.days : 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const data = await db
    .select({
      date: sql<string>`date_trunc('day', download_date)::date::text`,
      downloads: sql<number>`count(*)::int`,
    })
    .from(downloadsLogTable)
    .where(gte(downloadsLogTable.downloadDate, startDate))
    .groupBy(sql`date_trunc('day', download_date)`)
    .orderBy(sql`date_trunc('day', download_date)`);

  res.json(data);
});

router.get("/analytics/student-stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const [{ totalDownloads }] = await db
    .select({ totalDownloads: sql<number>`count(*)::int` })
    .from(downloadsLogTable)
    .where(sql`user_id = ${userId}`);

  const [{ totalBookmarks }] = await db
    .select({ totalBookmarks: sql<number>`count(*)::int` })
    .from(bookmarksTable)
    .where(sql`student_id = ${userId}`);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [{ newFilesThisWeek }] = await db
    .select({ newFilesThisWeek: sql<number>`count(*)::int` })
    .from(filesTable)
    .where(gte(filesTable.uploadDate, oneWeekAgo));

  res.json({ totalDownloads, totalBookmarks, newFilesThisWeek });
});

export default router;
