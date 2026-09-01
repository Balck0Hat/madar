import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { answerSchema, submitSchema, verifySchema } from "./exam.validation.js";
import * as ctrl from "./exam.controller.js";

export const prefix = "/exam";
const router = Router();

router.get("/status", requireAuth, ctrl.status);
router.post("/start", requireAuth, ctrl.start);
router.post("/answer", requireAuth, validate(answerSchema), ctrl.answer);
router.post("/submit", requireAuth, validate(submitSchema), ctrl.submit);
// عام: التحقق من شهادة برمزها
router.get("/verify/:code", validate(verifySchema), ctrl.verify);

export default router;
