import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { getUnitSchema, quizSchema, summariesSchema } from "./content.validation.js";
import * as ctrl from "./content.controller.js";

export const prefix = "/content";
const router = Router();

router.get("/units", ctrl.listIds);
router.get("/units/:unitId", validate(getUnitSchema), ctrl.getUnit);
router.get("/units/:unitId/quiz", requireAuth, validate(quizSchema), ctrl.getQuiz);
router.get("/summaries", requireAuth, validate(summariesSchema), ctrl.getSummaries);

export default router;
