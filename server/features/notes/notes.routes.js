import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { createSchema, listSchema, updateSchema, idSchema } from "./notes.validation.js";
import * as ctrl from "./notes.controller.js";

export const prefix = "/notes";
const router = Router();

// التظليلات خاصة بصاحبها دائماً: لا مسار عام هنا
router.post("/", requireAuth, validate(createSchema), ctrl.create);
router.get("/", requireAuth, validate(listSchema), ctrl.list);
router.patch("/:id", requireAuth, validate(updateSchema), ctrl.update);
router.delete("/:id", requireAuth, validate(idSchema), ctrl.remove);

export default router;
