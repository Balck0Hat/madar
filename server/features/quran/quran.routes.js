import { Router } from "express";
import { requireAuth } from "../../shared/middleware/auth.js";
import { validate } from "../../shared/middleware/validate.js";
import { suraSchema, pageSchema, ayahSchema, goalSchema, reviewSchema, sessionSchema } from "./quran.validation.js";
import * as ctrl from "./quran.controller.js";

export const prefix = "/quran";
const router = Router();

router.get("/suras", requireAuth, ctrl.suras);
router.get("/sura/:n", requireAuth, validate(suraSchema), ctrl.sura);
router.get("/page/:p", requireAuth, validate(pageSchema), ctrl.page);
router.get("/similar/:s/:a", requireAuth, validate(ayahSchema), ctrl.similar);

router.get("/memo", requireAuth, ctrl.overview);
router.put("/memo/goal", requireAuth, validate(goalSchema), ctrl.setGoal);
router.post("/memo/review", requireAuth, validate(reviewSchema), ctrl.review);
router.post("/memo/session", requireAuth, validate(sessionSchema), ctrl.logSession);

export default router;
