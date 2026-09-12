import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { listSchema, getSchema } from "./figures.validation.js";
import * as ctrl from "./figures.controller.js";

export const prefix = "/figures";
const router = Router();

router.get("/", requireAuth, validate(listSchema), ctrl.list);
router.get("/:figureId", requireAuth, validate(getSchema), ctrl.get);

export default router;
