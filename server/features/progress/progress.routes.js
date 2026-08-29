import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { finishSchema, resumeSchema } from "./progress.validation.js";
import * as ctrl from "./progress.controller.js";

export const prefix = "/progress";
const router = Router();

router.get("/", requireAuth, ctrl.getState);
router.get("/stats", requireAuth, ctrl.getStats);
router.post("/units/:unitId/finish", requireAuth, validate(finishSchema), ctrl.finishUnit);
router.put("/units/:unitId/resume", requireAuth, validate(resumeSchema), ctrl.setResume);

export default router;
