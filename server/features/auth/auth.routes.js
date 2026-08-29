import { Router } from "express";
import { validate } from "../../shared/middleware/validate.js";
import { authLimiter } from "../../shared/middleware/rateLimiter.js";
import { registerSchema, loginSchema } from "./auth.validation.js";
import * as ctrl from "./auth.controller.js";

export const prefix = "/auth";
const router = Router();

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);

export default router;
