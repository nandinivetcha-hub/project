import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { db, announcementsTable } from "@workspace/db";
import {
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
  UpdateAnnouncementParams,
  DeleteAnnouncementParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/announcements", async (_req, res): Promise<void> => {
  const announcements = await db
    .select()
    .from(announcementsTable)
    .orderBy(desc(announcementsTable.datePosted));

  res.json(
    announcements.map((a) => ({
      ...a,
      datePosted: a.datePosted.toISOString(),
    }))
  );
});

router.post("/announcements", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [announcement] = await db
    .insert(announcementsTable)
    .values({ ...parsed.data, postedBy: req.user!.userId })
    .returning();

  res.status(201).json({
    ...announcement,
    datePosted: announcement.datePosted.toISOString(),
  });
});

router.patch("/announcements/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAnnouncementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== null && v !== undefined) updateData[k] = v;
  }

  const [announcement] = await db
    .update(announcementsTable)
    .set(updateData)
    .where(eq(announcementsTable.id, params.data.id))
    .returning();

  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  res.json({
    ...announcement,
    datePosted: announcement.datePosted.toISOString(),
  });
});

router.delete("/announcements/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAnnouncementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [announcement] = await db
    .delete(announcementsTable)
    .where(eq(announcementsTable.id, params.data.id))
    .returning();

  if (!announcement) {
    res.status(404).json({ error: "Announcement not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
