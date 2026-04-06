import { Router, type IRouter } from "express";
import { eq, ilike, and, sql, desc, or } from "drizzle-orm";
import { db, filesTable, downloadsLogTable } from "@workspace/db";
import {
  ListFilesQueryParams,
  CreateFileBody,
  UpdateFileBody,
  GetFileParams,
  UpdateFileParams,
  DeleteFileParams,
  TrackDownloadParams,
  GetTrendingFilesQueryParams,
  GetRecentFilesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/files/trending", async (req, res): Promise<void> => {
  const params = GetTrendingFilesQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 8;

  const files = await db
    .select()
    .from(filesTable)
    .orderBy(desc(filesTable.downloads))
    .limit(limit);

  res.json(
    files.map((f) => ({
      ...f,
      uploadDate: f.uploadDate.toISOString(),
    }))
  );
});

router.get("/files/recent", async (req, res): Promise<void> => {
  const params = GetRecentFilesQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 6;

  const files = await db
    .select()
    .from(filesTable)
    .orderBy(desc(filesTable.uploadDate))
    .limit(limit);

  res.json(
    files.map((f) => ({
      ...f,
      uploadDate: f.uploadDate.toISOString(),
    }))
  );
});

router.get("/files", async (req, res): Promise<void> => {
  const params = ListFilesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { search, branch, year, semester, subject, fileType, sortBy, page, limit } = params.data;
  const pageNum = page ?? 1;
  const limitNum = limit ?? 12;
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(filesTable.title, `%${search}%`),
        ilike(filesTable.subject, `%${search}%`),
        ilike(filesTable.keywords, `%${search}%`)
      )
    );
  }
  if (branch) conditions.push(eq(filesTable.branch, branch));
  if (year) conditions.push(eq(filesTable.year, year));
  if (semester) conditions.push(eq(filesTable.semester, semester));
  if (subject) conditions.push(ilike(filesTable.subject, `%${subject}%`));
  if (fileType) conditions.push(eq(filesTable.fileType, fileType));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderClause = desc(filesTable.uploadDate);
  if (sortBy === "downloads") orderClause = desc(filesTable.downloads);
  else if (sortBy === "alphabetical") orderClause = sql`${filesTable.title} ASC`;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(filesTable)
    .where(whereClause);

  const files = await db
    .select()
    .from(filesTable)
    .where(whereClause)
    .orderBy(orderClause)
    .limit(limitNum)
    .offset(offset);

  res.json({
    files: files.map((f) => ({ ...f, uploadDate: f.uploadDate.toISOString() })),
    total: count,
    page: pageNum,
    totalPages: Math.ceil(count / limitNum),
  });
});

router.post("/files", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [file] = await db
    .insert(filesTable)
    .values({ ...parsed.data, uploadedBy: req.user!.userId })
    .returning();

  res.status(201).json({ ...file, uploadDate: file.uploadDate.toISOString() });
});

router.get("/files/:id", async (req, res): Promise<void> => {
  const params = GetFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db.select().from(filesTable).where(eq(filesTable.id, params.data.id));
  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json({ ...file, uploadDate: file.uploadDate.toISOString() });
});

router.patch("/files/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateFileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) updateData[k] = v;
  }

  const [file] = await db
    .update(filesTable)
    .set(updateData)
    .where(eq(filesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.json({ ...file, uploadDate: file.uploadDate.toISOString() });
});

router.delete("/files/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteFileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .delete(filesTable)
    .where(eq(filesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/files/:id/download", requireAuth, async (req, res): Promise<void> => {
  const params = TrackDownloadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [file] = await db
    .update(filesTable)
    .set({ downloads: sql`${filesTable.downloads} + 1` })
    .where(eq(filesTable.id, params.data.id))
    .returning();

  if (!file) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  await db.insert(downloadsLogTable).values({
    fileId: params.data.id,
    userId: req.user!.userId,
  });

  res.json({ downloads: file.downloads, driveLink: file.driveLink });
});

export default router;
