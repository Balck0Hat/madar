import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/middleware/validate.js";
import * as ctrl from "./public.controller.js";

export const prefix = "/public";
const router = Router();

router.get("/users/:handle", validate({ params: z.object({ handle: z.string().trim().min(1).max(40) }) }), ctrl.profile);

export default router;
