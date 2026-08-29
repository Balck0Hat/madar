import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { answerSchema } from "./reviews.validation.js";
import * as ctrl from "./reviews.controller.js";

export const prefix = "/reviews";
const router = Router();

router.get("/due", requireAuth, ctrl.due);
router.post("/:unitId/answer", requireAuth, validate(answerSchema), ctrl.answer);

export default router;
