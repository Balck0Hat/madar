import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { answerSchema } from "./challenge.validation.js";
import * as ctrl from "./challenge.controller.js";

export const prefix = "/challenge";
const router = Router();

router.get("/", requireAuth, ctrl.today);
router.post("/answer", requireAuth, validate(answerSchema), ctrl.answer);

export default router;
