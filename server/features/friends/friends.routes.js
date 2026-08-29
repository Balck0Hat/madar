import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { requestSchema, idParamSchema } from "./friends.validation.js";
import * as ctrl from "./friends.controller.js";

export const prefix = "/friends";
const router = Router();

router.use(requireAuth);
router.get("/", ctrl.list);
router.get("/league", ctrl.league);
router.post("/requests", validate(requestSchema), ctrl.request);
router.post("/requests/:id/accept", validate(idParamSchema), ctrl.accept);
router.delete("/:id", validate(idParamSchema), ctrl.remove);

export default router;
