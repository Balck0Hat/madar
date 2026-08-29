import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { startSchema, answerSchema } from "./quizAttempt.validation.js";
import * as ctrl from "./quizAttempt.controller.js";

export const prefix = "/quiz-attempts";
const router = Router();

router.post("/:unitId/start", requireAuth, validate(startSchema), ctrl.start);
router.patch("/:unitId", requireAuth, validate(answerSchema), ctrl.saveAnswer);

export default router;
