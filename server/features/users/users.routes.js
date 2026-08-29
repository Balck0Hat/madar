import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { updateMeSchema } from "./users.validation.js";
import * as ctrl from "./users.controller.js";

export const prefix = "/users";
const router = Router();

router.get("/me", requireAuth, ctrl.getMe);
router.patch("/me", requireAuth, validate(updateMeSchema), ctrl.updateMe);

export default router;
