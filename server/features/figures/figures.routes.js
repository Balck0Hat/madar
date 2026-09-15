import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { listSchema, getSchema, progressSchema } from "./figures.validation.js";
import * as ctrl from "./figures.controller.js";

export const prefix = "/figures";
const router = Router();

// الصفحة العامة: ملف واحد بلا تسجيل دخول، لمن وصله رابط مشاركة.
// القائمة والتقدّم تبقى خلف الدخول.
router.get("/public/:figureId", validate(getSchema), ctrl.get);

router.get("/progress", requireAuth, ctrl.getProgress);
router.put("/progress/:figureId", requireAuth, validate(progressSchema), ctrl.setProgress);

router.get("/", requireAuth, validate(listSchema), ctrl.list);
router.get("/:figureId", requireAuth, validate(getSchema), ctrl.get);

export default router;
