import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { bookSchema, chapterSchema, progressSchema } from "./books.validation.js";
import * as ctrl from "./books.controller.js";

export const prefix = "/books";
const router = Router();

router.get("/progress", requireAuth, ctrl.getProgress);
router.put("/progress/:bookId", requireAuth, validate(progressSchema), ctrl.setProgress);
router.get("/", requireAuth, ctrl.list);
router.get("/:bookId", requireAuth, validate(bookSchema), ctrl.get);
router.get("/:bookId/full", requireAuth, validate(bookSchema), ctrl.full);
router.get("/:bookId/chapters/:n", requireAuth, validate(chapterSchema), ctrl.chapter);

export default router;
