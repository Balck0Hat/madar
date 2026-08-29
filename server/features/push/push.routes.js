import { Router } from "express";
import { requireAuth, optionalAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { subscribeSchema, unsubscribeSchema } from "./push.validation.js";
import * as ctrl from "./push.controller.js";

export const prefix = "/push";
const router = Router();

router.get("/key", optionalAuth, ctrl.key);
router.post("/subscribe", requireAuth, validate(subscribeSchema), ctrl.subscribe);
router.post("/unsubscribe", requireAuth, validate(unsubscribeSchema), ctrl.unsubscribe);
router.post("/test", requireAuth, ctrl.test);

export default router;
