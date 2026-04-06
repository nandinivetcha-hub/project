import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, bookmarksTable, filesTable } from "@workspace/db";
import { AddBookmarkBody, RemoveBookmarkParams } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/bookmarks", requireAuth, async (req, res): Promise<void> => {
  const bookmarks = await db
    .select({
      id: bookmarksTable.id,
      studentId: bookmarksTable.studentId,
      fileId: bookmarksTable.fileId,
      savedDate: bookmarksTable.savedDate,
      file: filesTable,
    })
    .from(bookmarksTable)
    .leftJoin(filesTable, eq(bookmarksTable.fileId, filesTable.id))
    .where(eq(bookmarksTable.studentId, req.user!.userId));

  res.json(
    bookmarks
      .filter((b) => b.file !== null)
      .map((b) => ({
        id: b.id,
        studentId: b.studentId,
        fileId: b.fileId,
        savedDate: b.savedDate.toISOString(),
        file: { ...b.file!, uploadDate: b.file!.uploadDate.toISOString() },
      }))
  );
});

router.post("/bookmarks", requireAuth, async (req, res): Promise<void> => {
  const parsed = AddBookmarkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(bookmarksTable)
    .where(
      and(
        eq(bookmarksTable.studentId, req.user!.userId),
        eq(bookmarksTable.fileId, parsed.data.fileId)
      )
    );

  if (existing) {
    res.status(409).json({ error: "Already bookmarked" });
    return;
  }

  const [bookmark] = await db
    .insert(bookmarksTable)
    .values({ studentId: req.user!.userId, fileId: parsed.data.fileId })
    .returning();

  res.status(201).json({
    ...bookmark,
    savedDate: bookmark.savedDate.toISOString(),
  });
});

router.delete("/bookmarks/:fileId", requireAuth, async (req, res): Promise<void> => {
  const params = RemoveBookmarkParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [bookmark] = await db
    .delete(bookmarksTable)
    .where(
      and(
        eq(bookmarksTable.studentId, req.user!.userId),
        eq(bookmarksTable.fileId, params.data.fileId)
      )
    )
    .returning();

  if (!bookmark) {
    res.status(404).json({ error: "Bookmark not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
