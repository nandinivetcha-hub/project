import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import filesRouter from "./files";
import bookmarksRouter from "./bookmarks";
import announcementsRouter from "./announcements";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(filesRouter);
router.use(bookmarksRouter);
router.use(announcementsRouter);
router.use(analyticsRouter);

export default router;
