import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { searchSchema } from "./search.validation.js";
import * as ctrl from "./search.controller.js";

export const prefix = "/search";
const router = Router();

router.get("/", requireAuth, validate(searchSchema), ctrl.search);

export default router;
