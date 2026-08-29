import { Router } from "express";
import { requireAuth, requireAdmin } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { eventSchema, funnelSchema, hardSchema } from "./analytics.validation.js";
import * as ctrl from "./analytics.controller.js";

export const prefix = "/analytics";
const router = Router();

// المتعلم يبلّغ عن موضعه؛ القراءة للمشرف وحده
router.post("/event", requireAuth, validate(eventSchema), ctrl.event);
router.get("/funnel", requireAdmin, validate(funnelSchema), ctrl.funnel);
router.get("/hard-questions", requireAdmin, validate(hardSchema), ctrl.hardQuestions);

export default router;
